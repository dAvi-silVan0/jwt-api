const bookService = require('./book.service');

const bookController = {
    create: async (req, res) => {
        try {
            const book = await bookService.create(req.body);
            res.status(201).json(book);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const books = await bookService.findAll(req.query);
            res.json(books);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const book = await bookService.findById(req.params.id);
            res.json(book);
        } catch (error) {
            res.status(error.status || 404).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const book = await bookService.update(req.params.id, req.body);
            res.json(book);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await bookService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = bookController;