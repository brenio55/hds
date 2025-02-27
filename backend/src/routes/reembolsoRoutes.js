const express = require('express');
const ReembolsoController = require('../controllers/reembolsoController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/reembolso:
 *   post:
 *     summary: Cria um novo reembolso
 *     tags: [Reembolso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_funcionarios
 *               - valor
 *               - prazo
 *               - descricao
 *             properties:
 *               id_funcionarios:
 *                 type: integer
 *               valor:
 *                 type: number
 *               prazo:
 *                 type: string
 *                 format: date
 *               descricao:
 *                 type: string
 */
router.post('/', authMiddleware, ReembolsoController.create);

/**
 * @swagger
 * /api/reembolso/{id}:
 *   put:
 *     summary: Atualiza um reembolso existente
 *     tags: [Reembolso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_funcionarios:
 *                 type: integer
 *               valor:
 *                 type: number
 *               prazo:
 *                 type: string
 *                 format: date
 *               descricao:
 *                 type: string
 */
router.put('/:id', authMiddleware, ReembolsoController.update);

/**
 * @swagger
 * /api/reembolso:
 *   get:
 *     summary: Lista reembolsos com filtro opcional
 *     tags: [Reembolso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campo
 *         schema:
 *           type: string
 *         description: Campo para filtrar (id, id_funcionarios, valor, prazo, descricao, created_at)
 *       - in: query
 *         name: valor
 *         schema:
 *           type: string
 *         description: Valor para filtrar
 */
router.get('/', authMiddleware, ReembolsoController.findAll);

module.exports = router; 