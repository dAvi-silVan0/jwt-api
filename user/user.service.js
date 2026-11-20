const bcrypt = require('bcrypt');
const User = require('./user.model');

const userService = {
    create: async (userData) => {
        try {
            userData.password = await bcrypt.hash(userData.password, 10);
            const user = await User.create(userData);
            const { password, ...userWithoutPassword } = user.toJSON();
            return userWithoutPassword;
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    },

    findById: async (id) => {
        return await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
    },

    findByEmail: async (email) => {
        return await User.findOne({
            where: { email },
            attributes: { exclude: ['password'] }
        });
    },

    // Uso interno exclusivo do authService.login
    findByEmailWithPassword: async (email) => {
        return await User.findOne({ where: { email } });
    },

    findAll: async () => {
        return await User.findAll({
            attributes: { exclude: ['password'] }
        });
    },

    update: async (id, userData) => {
        const user = await User.findByPk(id);
        if (!user) return null;

        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        } else {
            delete userData.password;
        }

        await user.update(userData);
        const { password, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    },

    updateActive: async (id, active) => {
        const user = await User.findByPk(id);
        if (!user) return null;

        // Se 'active' vier boolean no body, aplica; caso contrário, inverte o estado atual
        const nextState = typeof active === 'boolean' ? active : !user.active;
        await user.update({ active: nextState });

        const { password, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }
};

module.exports = userService;