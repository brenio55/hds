const express = require('express');
const PedidoLocacaoController = require('../controllers/pedidoLocacaoController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/pedidos-locacao:
 *   post:
 *     summary: Cria um novo pedido de locação
 *     tags: [Pedidos de Locação]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, PedidoLocacaoController.create);

/**
 * @swagger
 * /api/pedidos-locacao/{id}:
 *   put:
 *     summary: Atualiza um pedido de locação
 *     tags: [Pedidos de Locação]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, PedidoLocacaoController.update);

/**
 * @swagger
 * /api/pedidos-locacao/{id}:
 *   delete:
 *     summary: Remove um pedido de locação
 *     tags: [Pedidos de Locação]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, PedidoLocacaoController.delete);

/**
 * @swagger
 * /api/pedidos-locacao:
 *   get:
 *     summary: Lista todos os pedidos de locação
 *     tags: [Pedidos de Locação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, PedidoLocacaoController.findAll);

/**
 * @swagger
 * /api/pedidos-locacao/{id}:
 *   get:
 *     summary: Busca um pedido de locação por ID
 *     tags: [Pedidos de Locação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, PedidoLocacaoController.findById);

/**
 * @swagger
 * /api/pedidos-locacao/{id}/pdf/download:
 *   get:
 *     summary: Faz download do PDF do pedido de locação
 *     tags: [Pedidos de Locação]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/pdf/download', authMiddleware, PedidoLocacaoController.downloadPdf);

module.exports = router; 