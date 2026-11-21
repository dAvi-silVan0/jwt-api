const { Router } = require('express');
const router = Router();
const bookController = require('./book.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.get('/', authMiddleware, bookController.findAll);
router.get('/:id', authMiddleware, bookController.findById);
router.post('/', authMiddleware, isAdmin, bookController.create);
router.put('/:id', authMiddleware, isAdmin, bookController.update);
router.delete('/:id', authMiddleware, isAdmin, bookController.delete);

module.exports = router;