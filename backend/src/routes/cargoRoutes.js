const express = require('express');
const CargoController = require('../controllers/cargoController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /api/cargos:
 *   post:
 *     summary: Cria um novo cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  authMiddleware, 
  [
    body('nome').notEmpty().withMessage('Nome do cargo é obrigatório'),
    body('valor_hh').isNumeric().withMessage('Valor do HH deve ser um número')
  ],
  CargoController.create
);

/**
 * @swagger
 * /api/cargos:
 *   get:
 *     summary: Lista todos os cargos
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, CargoController.findAll);

/**
 * @swagger
 * /api/cargos/{id}:
 *   get:
 *     summary: Busca um cargo pelo ID
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, CargoController.findById);

/**
 * @swagger
 * /api/cargos/{id}:
 *   put:
 *     summary: Atualiza um cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
  authMiddleware,
  [
    body('nome').optional().notEmpty().withMessage('Nome do cargo não pode ser vazio'),
    body('valor_hh').optional().isNumeric().withMessage('Valor do HH deve ser um número')
  ],
  CargoController.update
);

/**
 * @swagger
 * /api/cargos/{id}:
 *   delete:
 *     summary: Remove um cargo
 *     tags: [Cargos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, CargoController.delete);

module.exports = router; 