const authorService = require('./author.service');

const authorController = {
    create: async (req, res) => {
        try {
            const author = await authorService.create(req.body);
            res.status(201).json(author);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const authors = await authorService.findAll();
            res.json(authors);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const author = await authorService.findById(req.params.id);
            res.json(author);
        } catch (error) {
            res.status(error.status || 404).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const author = await authorService.update(req.params.id, req.body);
            res.json(author);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await authorService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = authorController;