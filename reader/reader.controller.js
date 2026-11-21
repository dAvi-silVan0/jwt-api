const readerService = require('./reader.service');
const loanService = require('../loan/loan.service');

const readerController = {
    create: async (req, res) => {
        try {
            const reader = await readerService.create(req.body);
            res.status(201).json(reader);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findAll: async (req, res) => {
        try {
            const readers = await readerService.findAll();
            res.json(readers);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findById: async (req, res) => {
        try {
            const reader = await readerService.findById(req.params.id);
            res.json(reader);
        } catch (error) {
            res.status(error.status || 404).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const reader = await readerService.update(req.params.id, req.body);
            res.json(reader);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    findLoans: async (req, res) => {
        try {
            await readerService.findById(req.params.id); // Garante 404 se o leitor não existir
            const loans = await loanService.findByReaderId(req.params.id);
            res.json(loans);
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    }
};

module.exports = readerController;