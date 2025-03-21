const express = require('express');
const CustoObraController = require('../controllers/custoObraController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/custos-obra:
 *   post:
 *     summary: Cria um novo custo de obra
 *     tags: [Custos Obra]
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
 *               - obra
 *               - duracao
 *             properties:
 *               valor:
 *                 type: number
 *               obra:
 *                 type: string
 *               duracao:
 *                 type: string
 *                 format: date
 */
router.post('/', authMiddleware, CustoObraController.create);

/**
 * @swagger
 * /api/custos-obra:
 *   get:
 *     summary: Lista custos de obra com filtro opcional
 *     tags: [Custos Obra]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campo
 *         schema:
 *           type: string
 *         description: Campo para filtrar (id, valor, obra, duracao, created_at)
 *       - in: query
 *         name: valor
 *         schema:
 *           type: string
 *         description: Valor para filtrar
 */
router.get('/', authMiddleware, CustoObraController.findAll);

/**
 * @swagger
 * /api/custos-obra/{id}:
 *   get:
 *     summary: Busca um custo de obra pelo ID
 *     tags: [Custos Obra]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, CustoObraController.findById);

/**
 * @swagger
 * /api/custos-obra/{id}:
 *   put:
 *     summary: Atualiza um custo de obra
 *     tags: [Custos Obra]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, CustoObraController.update);

/**
 * @swagger
 * /api/custos-obra/{id}:
 *   delete:
 *     summary: Remove um custo de obra
 *     tags: [Custos Obra]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, CustoObraController.delete);

module.exports = router; 