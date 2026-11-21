const { Router } = require('express');
const router = Router();
const categoryController = require('./category.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.get('/', authMiddleware, categoryController.findAll);
router.get('/:id', authMiddleware, categoryController.findById);
router.post('/', authMiddleware, isAdmin, categoryController.create);
router.put('/:id', authMiddleware, isAdmin, categoryController.update);
router.delete('/:id', authMiddleware, isAdmin, categoryController.delete);

module.exports = router;