const { Router } = require('express');
const router = Router();
const loanController = require('./loan.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.get('/dashboard', authMiddleware, isAdmin, loanController.dashboard);

module.exports = router;