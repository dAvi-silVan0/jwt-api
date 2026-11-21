const categoryService = require('./category.service');

const categoryController = {
    create: async (req, res) => {
        try {
            const category = await categoryService.create(req.body);
            res.status(201).json(category);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const categories = await categoryService.findAll();
            res.json(categories);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const category = await categoryService.findById(req.params.id);
            res.json(category);
        } catch (error) {
            res.status(error.status || 404).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const category = await categoryService.update(req.params.id, req.body);
            res.json(category);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            await categoryService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = categoryController;