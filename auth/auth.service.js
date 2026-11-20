const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userService = require('../user/user.service');
const { RefreshToken } = require('../models');

const authService = {
    generateTokenPair: async (user) => {
        const accessToken = jwt.sign(
            {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' } // Para gravar o vídeo depois, troque temporariamente para '30s'
        );

        const refreshToken = jwt.sign(
            {
                id: user.id,
                jti: crypto.randomUUID() // Garante token único mesmo em logins no mesmo segundo
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
            expiresAt,
            revoked: false
        });

        return { accessToken, refreshToken };
    },

    login: async (email, password) => {
        const user = await userService.findByEmailWithPassword(email);
        if (!user) {
            const err = new Error('Invalid email or password');
            err.status = 401;
            throw err;
        }

        if (!user.active) {
            const err = new Error('Usuário desativado. Contate o administrador.');
            err.status = 403;
            throw err;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const err = new Error('Invalid email or password');
            err.status = 401;
            throw err;
        }

        const tokens = await authService.generateTokenPair(user);

        return {
            ...tokens,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                active: user.active
            }
        };
    },

    refresh: async (token) => {
        if (!token) {
            const err = new Error('Refresh token não informado.');
            err.status = 401;
            throw err;
        }

        try {
            jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            const err = new Error('Refresh token inválido ou expirado.');
            err.status = 401;
            throw err;
        }

        const storedToken = await RefreshToken.findOne({ where: { token } });
        if (!storedToken) {
            const err = new Error('Refresh token não encontrado.');
            err.status = 401;
            throw err;
        }

        // Detecção de roubo/reuso: revoga TODOS os tokens do usuário se um já revogado for reutilizado
        if (storedToken.revoked) {
            await RefreshToken.update(
                { revoked: true },
                { where: { userId: storedToken.userId } }
            );
            const err = new Error('Reuso de refresh token detectado. Sessões encerradas por segurança.');
            err.status = 401;
            throw err;
        }

        if (new Date() > new Date(storedToken.expiresAt)) {
            storedToken.revoked = true;
            await storedToken.save();
            const err = new Error('Refresh token expirado.');
            err.status = 401;
            throw err;
        }

        const user = await userService.findById(storedToken.userId);
        if (!user || !user.active) {
            storedToken.revoked = true;
            await storedToken.save();
            const err = new Error('Usuário inativo ou inexistente.');
            err.status = 401;
            throw err;
        }

        // Rotação: invalida o refresh token atual antes de emitir o próximo
        storedToken.revoked = true;
        await storedToken.save();

        return await authService.generateTokenPair(user);
    },

    logout: async (refreshToken) => {
        if (!refreshToken) {
            const err = new Error('Refresh token não informado.');
            err.status = 400;
            throw err;
        }

        const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (storedToken) {
            storedToken.revoked = true;
            await storedToken.save();
        }
    },

    verifyToken: async (token) => {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
};

module.exports = authService;