const express = require('express');
const FaturamentoController = require('../controllers/faturamentoController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, FaturamentoController.create);
router.get('/', authMiddleware, FaturamentoController.findAll);
router.get('/:id', authMiddleware, FaturamentoController.findById);
router.put('/:id', authMiddleware, FaturamentoController.update);
router.delete('/:id', authMiddleware, FaturamentoController.delete);

module.exports = router; 