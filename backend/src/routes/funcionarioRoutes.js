const express = require('express');
const FuncionarioController = require('../controllers/funcionarioController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/funcionarios:
 *   post:
 *     summary: Cria um novo funcionário
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authMiddleware, FuncionarioController.create);

/**
 * @swagger
 * /api/funcionarios:
 *   get:
 *     summary: Lista todos os funcionários
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, FuncionarioController.findAll);

/**
 * @swagger
 * /api/funcionarios/{id}:
 *   get:
 *     summary: Busca um funcionário pelo ID
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, FuncionarioController.findById);

/**
 * @swagger
 * /api/funcionarios/{id}:
 *   put:
 *     summary: Atualiza um funcionário
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authMiddleware, FuncionarioController.update);

/**
 * @swagger
 * /api/funcionarios/{id}:
 *   delete:
 *     summary: Remove um funcionário
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, FuncionarioController.delete);

module.exports = router; 