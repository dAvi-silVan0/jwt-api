const { Author } = require('../models');

const authorService = {
    create: async (data) => {
        if (!data.name) {
            const err = new Error('O nome do autor é obrigatório.');
            err.status = 400;
            throw err;
        }
        return await Author.create(data);
    },

    findAll: async () => {
        return await Author.findAll({ order: [['name', 'ASC']] });
    },

    findById: async (id) => {
        const author = await Author.findByPk(id);
        if (!author) {
            const err = new Error('Autor não encontrado.');
            err.status = 404;
            throw err;
        }
        return author;
    },

    update: async (id, data) => {
        const author = await authorService.findById(id);
        return await author.update(data);
    },

    delete: async (id) => {
        const author = await authorService.findById(id);

        // Regra 6: verifica vínculo N:N na tabela BookAuthor via método gerado pelo Sequelize
        const linkedBooks = await author.countBooks();
        if (linkedBooks > 0) {
            const err = new Error(`Não é possível excluir: existem ${linkedBooks} livro(s) vinculado(s) a este autor.`);
            err.status = 409;
            throw err;
        }

        await author.destroy();
    }
};

module.exports = authorService;