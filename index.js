const dotenv = require('dotenv');
dotenv.config();
const bcrypt = require('bcrypt');
const db = require('./config/db');
const { User } = require('./models'); // Carrega todos os 7 models e associações
const express = require('express');
const cors = require('cors');
const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

app.use('/v1/auth', authRouter);
app.use('/v1/user', userRouter);

async function seedAdmin() {
    const adminExists = await User.findOne({ where: { email: 'admin@biblioteca.com' } });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('123456', 10);
        await User.create({
            name: 'Administrador',
            username: 'admin',
            email: 'admin@biblioteca.com',
            password: hashedPassword,
            isAdmin: true,
            active: true
        });
        console.log('Seed: Administrador padrão criado (admin@biblioteca.com / 123456)');
    }
}

db.sync().then(async () => {
    await seedAdmin();
    app.listen(PORT, () => {
        console.log(`SERVIDOR RODANDO http://localhost:${PORT}`);
    });
});