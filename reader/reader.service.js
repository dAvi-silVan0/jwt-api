const { Reader } = require('../models');

const readerService = {
    create: async (data) => {
        if (!data.name || !data.cpf) {
            const err = new Error('Nome e CPF do leitor são obrigatórios.');
            err.status = 400;
            throw err;
        }
        return await Reader.create(data);
    },

    findAll: async () => {
        return await Reader.findAll({ order: [['name', 'ASC']] });
    },

    findById: async (id) => {
        const reader = await Reader.findByPk(id);
        if (!reader) {
            const err = new Error('Leitor não encontrado.');
            err.status = 404;
            throw err;
        }
        return reader;
    },

    update: async (id, data) => {
        const reader = await readerService.findById(id);
        return await reader.update(data);
    }
};

module.exports = readerService;