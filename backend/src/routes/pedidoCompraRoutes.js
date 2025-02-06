const express = require('express');
const PedidoCompraController = require('../controllers/pedidoCompraController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, PedidoCompraController.create);
router.get('/', authMiddleware, PedidoCompraController.findAll);
router.get('/:id', authMiddleware, PedidoCompraController.findById);
router.put('/:id', authMiddleware, PedidoCompraController.update);

module.exports = router; 