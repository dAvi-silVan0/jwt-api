const { Router } = require('express');
const router = Router();
const authorController = require('./author.controller');
const { authMiddleware, isAdmin } = require('../auth/auth.middleware');

router.get('/', authMiddleware, authorController.findAll);
router.get('/:id', authMiddleware, authorController.findById);
router.post('/', authMiddleware, isAdmin, authorController.create);
router.put('/:id', authMiddleware, isAdmin, authorController.update);
router.delete('/:id', authMiddleware, isAdmin, authorController.delete);

module.exports = router;