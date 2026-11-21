const { Op } = require('sequelize');
const db = require('../config/db');
const { Loan, Book, Reader, User } = require('../models');

const loanInclude = [
    { model: Book, attributes: ['id', 'title', 'isbn', 'availableCopies'] },
    { model: Reader, attributes: ['id', 'name', 'cpf', 'email'] },
    { model: User, attributes: ['id', 'name', 'email'] }
];

const loanService = {
    // Atualiza automaticamente para ATRASADO qualquer empréstimo em aberto com dueDate vencido
    syncOverdueLoans: async (transaction = null) => {
        await Loan.update(
            { status: 'ATRASADO' },
            {
                where: {
                    returnDate: null,
                    dueDate: { [Op.lt]: new Date() },
                    status: 'ATIVO'
                },
                ...(transaction ? { transaction } : {})
            }
        );
    },

    create: async ({ bookId, readerId, userId }) => {
        if (!bookId || !readerId) {
            const err = new Error('bookId e readerId são obrigatórios.');
            err.status = 400;
            throw err;
        }

        const createdLoan = await db.transaction(async (t) => {
            await loanService.syncOverdueLoans(t);

            const book = await Book.findByPk(bookId, { transaction: t });
            if (!book) {
                const err = new Error('Livro não encontrado.');
                err.status = 404;
                throw err;
            }

            if (book.availableCopies <= 0) {
                const err = new Error('Não há exemplares disponíveis deste livro para empréstimo.');
                err.status = 400;
                throw err;
            }

            const reader = await Reader.findByPk(readerId, { transaction: t });
            if (!reader) {
                const err = new Error('Leitor não encontrado.');
                err.status = 404;
                throw err;
            }

            // Regra 3: bloqueia se o leitor tiver qualquer empréstimo atrasado
            const overdueCount = await Loan.count({
                where: { readerId, status: 'ATRASADO' },
                transaction: t
            });
            if (overdueCount > 0) {
                const err = new Error('Leitor possui empréstimo(s) em atraso e não pode retirar novos livros.');
                err.status = 400;
                throw err;
            }

            // Regra 3: máximo de 3 empréstimos ativos simultâneos
            const activeCount = await Loan.count({
                where: { readerId, returnDate: null },
                transaction: t
            });
            if (activeCount >= 3) {
                const err = new Error('Leitor atingiu o limite máximo de 3 empréstimos ativos.');
                err.status = 400;
                throw err;
            }

            // Regra 2: prazo padrão de 7 dias
            const loanDate = new Date();
            const dueDate = new Date(loanDate.getTime() + 7 * 24 * 60 * 60 * 1000);

            const loan = await Loan.create(
                {
                    bookId,
                    readerId,
                    userId,
                    loanDate,
                    dueDate,
                    status: 'ATIVO',
                    fine: 0
                },
                { transaction: t }
            );

            // Regra 1: decrementa o estoque disponível
            await book.update(
                { availableCopies: book.availableCopies - 1 },
                { transaction: t }
            );

            return loan;
        });

        return await Loan.findByPk(createdLoan.id, { include: loanInclude });
    },

    returnBook: async (id) => {
        const updatedLoan = await db.transaction(async (t) => {
            const loan = await Loan.findByPk(id, { transaction: t });
            if (!loan) {
                const err = new Error('Empréstimo não encontrado.');
                err.status = 404;
                throw err;
            }

            if (loan.returnDate || loan.status === 'DEVOLVIDO') {
                const err = new Error('Este empréstimo já foi devolvido.');
                err.status = 400;
                throw err;
            }

            const returnDate = new Date();
            const dueDate = new Date(loan.dueDate);
            let fine = 0;

            // Regra 4: multa de R$ 1,00 por dia de atraso
            if (returnDate > dueDate) {
                const diffMs = returnDate.getTime() - dueDate.getTime();
                const daysLate = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                fine = daysLate * 1.0;
            }

            await loan.update(
                {
                    returnDate,
                    fine,
                    status: 'DEVOLVIDO'
                },
                { transaction: t }
            );

            const book = await Book.findByPk(loan.bookId, { transaction: t });
            if (book) {
                const nextAvailable = Math.min(book.totalCopies, book.availableCopies + 1);
                await book.update({ availableCopies: nextAvailable }, { transaction: t });
            }

            return loan;
        });

        return await Loan.findByPk(updatedLoan.id, { include: loanInclude });
    },

    findAll: async (status) => {
        await loanService.syncOverdueLoans();

        const where = {};
        if (status && ['ATIVO', 'ATRASADO', 'DEVOLVIDO'].includes(status.toUpperCase())) {
            where.status = status.toUpperCase();
        }

        return await Loan.findAll({
            where,
            include: loanInclude,
            order: [['loanDate', 'DESC']]
        });
    },

    findByReaderId: async (readerId) => {
        await loanService.syncOverdueLoans();

        return await Loan.findAll({
            where: { readerId },
            include: loanInclude,
            order: [['loanDate', 'DESC']]
        });
    },

    getDashboard: async () => {
        await loanService.syncOverdueLoans();

        const [
            totalBooks,
            totalCopies,
            availableCopies,
            activeLoans,
            overdueLoans,
            totalFines
        ] = await Promise.all([
            Book.count(),
            Book.sum('totalCopies'),
            Book.sum('availableCopies'),
            Loan.count({ where: { returnDate: null } }),
            Loan.count({ where: { status: 'ATRASADO' } }),
            Loan.sum('fine')
        ]);

        return {
            totalBooks: totalBooks || 0,
            totalCopies: totalCopies || 0,
            availableCopies: availableCopies || 0,
            activeLoans: activeLoans || 0,
            overdueLoans: overdueLoans || 0,
            totalFines: Number((totalFines || 0).toFixed(2))
        };
    }
};

module.exports = loanService;