const loanService = require('./loan.service');

const loanController = {
    create: async (req, res) => {
        try {
            const { bookId, readerId } = req.body;
            const loan = await loanService.create({
                bookId,
                readerId,
                userId: req.user.id
            });
            res.status(201).json(loan);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    returnBook: async (req, res) => {
        try {
            const loan = await loanService.returnBook(req.params.id);
            res.json(loan);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const loans = await loanService.findAll(req.query.status);
            res.json(loans);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    dashboard: async (req, res) => {
        try {
            const stats = await loanService.getDashboard();
            res.json(stats);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = loanController;