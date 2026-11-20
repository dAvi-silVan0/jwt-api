const authService = require('./auth.service');
const userService = require('../user/user.service');

const authController = {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            res.json(result);
        } catch (error) {
            res.status(error.status || 401).json({ error: error.message });
        }
    },

    async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refresh(refreshToken);
            res.json(tokens);
        } catch (error) {
            res.status(error.status || 401).json({ error: error.message });
        }
    },

    async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            await authService.logout(refreshToken);
            res.json({ message: 'Logout realizado com sucesso.' });
        } catch (error) {
            res.status(error.status || 400).json({ error: error.message });
        }
    },

    async me(req, res) {
        try {
            const user = await userService.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = authController;