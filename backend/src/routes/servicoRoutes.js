const express = require('express');
const ServicoController = require('../controllers/servicoController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/servicos:
 *   post:
 *     summary: Cria um novo serviço
 *     tags: [Servicos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, ServicoController.create);

/**
 * @swagger
 * /api/servicos:
 *   get:
 *     summary: Lista todos os serviços
 *     tags: [Servicos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, ServicoController.findAll);

/**
 * @swagger
 * /api/servicos/{id}:
 *   get:
 *     summary: Busca um serviço pelo ID
 *     tags: [Servicos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, ServicoController.findById);

/**
 * @swagger
 * /api/servicos/{id}:
 *   put:
 *     summary: Atualiza um serviço
 *     tags: [Servicos]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, ServicoController.update);

/**
 * @swagger
 * /api/servicos/{id}:
 *   delete:
 *     summary: Remove um serviço
 *     tags: [Servicos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, ServicoController.delete);

module.exports = router; 