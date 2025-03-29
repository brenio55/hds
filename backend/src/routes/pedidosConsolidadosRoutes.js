const express = require('express');
const PedidosConsolidadosController = require('../controllers/pedidosConsolidadosController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/pedidos-consolidados:
 *   get:
 *     summary: Lista todos os pedidos (compra, locação e serviço) com dados relacionados
 *     tags: [Pedidos Consolidados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os pedidos enriquecidos com dados relacionados
 */
router.get('/', authMiddleware, PedidosConsolidadosController.findAll);

module.exports = router; 