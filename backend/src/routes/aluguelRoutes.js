const express = require('express');
const AluguelController = require('../controllers/aluguelController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/alugueis:
 *   post:
 *     summary: Cria um novo aluguel
 *     tags: [Alugueis]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, AluguelController.create);

/**
 * @swagger
 * /api/alugueis:
 *   get:
 *     summary: Lista todos os aluguéis
 *     tags: [Alugueis]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, AluguelController.findAll);

/**
 * @swagger
 * /api/alugueis/{id}:
 *   get:
 *     summary: Busca um aluguel por ID
 *     tags: [Alugueis]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, AluguelController.findById);

/**
 * @swagger
 * /api/alugueis/{id}:
 *   put:
 *     summary: Atualiza um aluguel
 *     tags: [Alugueis]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, AluguelController.update);

/**
 * @swagger
 * /api/alugueis/{id}:
 *   delete:
 *     summary: Remove um aluguel
 *     tags: [Alugueis]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, AluguelController.delete);

module.exports = router; 