const { Op } = require('sequelize');
const { Book, Category, Author, Loan } = require('../models');

const bookInclude = [
    { model: Category, attributes: ['id', 'name'] },
    { model: Author, attributes: ['id', 'name', 'nationality'], through: { attributes: [] } }
];

const bookService = {
    create: async (data) => {
        const { authorIds, ...bookData } = data;

        if (!bookData.title || !bookData.isbn) {
            const err = new Error('Título e ISBN são obrigatórios.');
            err.status = 400;
            throw err;
        }

        if (bookData.categoryId) {
            const category = await Category.findByPk(bookData.categoryId);
            if (!category) {
                const err = new Error('Categoria informada não existe.');
                err.status = 404;
                throw err;
            }
        }

        if (bookData.totalCopies !== undefined && bookData.availableCopies === undefined) {
            bookData.availableCopies = bookData.totalCopies;
        }

        const book = await Book.create(bookData);

        if (Array.isArray(authorIds) && authorIds.length > 0) {
            await book.setAuthors(authorIds);
        }

        return await bookService.findById(book.id);
    },

    findAll: async (filters = {}) => {
        const { title, categoryId, authorId, available } = filters;
        const where = {};

        if (title) {
            where.title = { [Op.like]: `%${title}%` };
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (available === 'true') {
            where.availableCopies = { [Op.gt]: 0 };
        }

        const authorInclude = {
            model: Author,
            attributes: ['id', 'name', 'nationality'],
            through: { attributes: [] }
        };

        if (authorId) {
            authorInclude.where = { id: authorId };
        }

        return await Book.findAll({
            where,
            include: [
                { model: Category, attributes: ['id', 'name'] },
                authorInclude
            ],
            order: [['title', 'ASC']]
        });
    },

    findById: async (id) => {
        const book = await Book.findByPk(id, { include: bookInclude });
        if (!book) {
            const err = new Error('Livro não encontrado.');
            err.status = 404;
            throw err;
        }
        return book;
    },

    update: async (id, data) => {
        const book = await Book.findByPk(id);
        if (!book) {
            const err = new Error('Livro não encontrado.');
            err.status = 404;
            throw err;
        }

        const { authorIds, ...bookData } = data;

        // Se totalCopies for alterado sem informar availableCopies, ajusta o disponível proporcionalmente
        if (bookData.totalCopies !== undefined && bookData.availableCopies === undefined) {
            const diff = Number(bookData.totalCopies) - book.totalCopies;
            bookData.availableCopies = Math.max(0, book.availableCopies + diff);
        }

        await book.update(bookData);

        if (Array.isArray(authorIds)) {
            await book.setAuthors(authorIds);
        }

        return await bookService.findById(id);
    },

    delete: async (id) => {
        const book = await Book.findByPk(id);
        if (!book) {
            const err = new Error('Livro não encontrado.');
            err.status = 404;
            throw err;
        }

        // Regra 6: impede exclusão de livro com empréstimos ativos (returnDate nulo)
        const activeLoans = await Loan.count({
            where: { bookId: id, returnDate: null }
        });

        if (activeLoans > 0) {
            const err = new Error(`Não é possível excluir: este livro possui ${activeLoans} empréstimo(s) ativo(s).`);
            err.status = 409;
            throw err;
        }

        await book.setAuthors([]);
        await book.destroy();
    }
};

module.exports = bookService;