const express = require('express');
const FornecedorController = require('../controllers/fornecedorController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, FornecedorController.create);
router.get('/', authMiddleware, FornecedorController.findAll);
router.get('/:id', authMiddleware, FornecedorController.findById);
router.put('/:id', authMiddleware, FornecedorController.update);

module.exports = router; 