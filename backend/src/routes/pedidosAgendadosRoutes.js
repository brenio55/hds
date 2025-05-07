const express = require('express');
const pedidosAgendadosController = require('../controllers/pedidosAgendadosController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/pedidos-agendados:
 *   get:
 *     summary: Lista todos os pedidos (compra, locação e serviço) com dados relacionados
 *     tags: [Pedidos Consolidados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos os pedidos enriquecidos com dados relacionados
 */
router.get('/', authMiddleware, pedidosAgendadosController.findAll);

module.exports = router; 