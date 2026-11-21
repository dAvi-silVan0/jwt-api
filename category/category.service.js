const { Category, Book } = require('../models');

const categoryService = {
    create: async (data) => {
        if (!data.name) {
            const err = new Error('O nome da categoria é obrigatório.');
            err.status = 400;
            throw err;
        }
        return await Category.create(data);
    },

    findAll: async () => {
        return await Category.findAll({ order: [['name', 'ASC']] });
    },

    findById: async (id) => {
        const category = await Category.findByPk(id);
        if (!category) {
            const err = new Error('Categoria não encontrada.');
            err.status = 404;
            throw err;
        }
        return category;
    },

    update: async (id, data) => {
        const category = await categoryService.findById(id);
        return await category.update(data);
    },

    delete: async (id) => {
        const category = await categoryService.findById(id);

        // Regra 6: impede exclusão se houver livros vinculados (409 Conflict)
        const linkedBooks = await Book.count({ where: { categoryId: id } });
        if (linkedBooks > 0) {
            const err = new Error(`Não é possível excluir: existem ${linkedBooks} livro(s) vinculado(s) a esta categoria.`);
            err.status = 409;
            throw err;
        }

        await category.destroy();
    }
};

module.exports = categoryService;