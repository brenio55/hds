const express = require('express');
const DividaController = require('../controllers/dividaController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/dividas:
 *   post:
 *     summary: Cria uma nova dívida
 *     tags: [Dividas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - valor
 *               - detalhes
 *             properties:
 *               valor:
 *                 type: number
 *               detalhes:
 *                 type: object
 */
router.post('/', authMiddleware, DividaController.create);

/**
 * @swagger
 * /api/dividas/{id}:
 *   put:
 *     summary: Atualiza uma dívida existente
 *     tags: [Dividas]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, DividaController.update);

/**
 * @swagger
 * /api/dividas:
 *   get:
 *     summary: Lista dívidas com filtro opcional
 *     tags: [Dividas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, DividaController.findAll);

module.exports = router; 