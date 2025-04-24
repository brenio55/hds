const express = require('express');
const HHRegistroController = require('../controllers/hhRegistroController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /api/hh-registros:
 *   post:
 *     summary: Cria um novo registro de horas trabalhadas
 *     tags: [HH-Registros]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  authMiddleware, 
  [
    body('funcionario_id').isNumeric().withMessage('ID do funcionário é obrigatório'),
    body('obra_id').isNumeric().withMessage('ID da obra é obrigatório'),
    body('horas_normais').isNumeric().withMessage('Quantidade de horas normais deve ser um número'),
    body('horas_60').isNumeric().withMessage('Quantidade de horas 60% deve ser um número'),
    body('horas_100').isNumeric().withMessage('Quantidade de horas 100% deve ser um número')
  ],
  HHRegistroController.create
);

/**
 * @swagger
 * /api/hh-registros:
 *   get:
 *     summary: Lista todos os registros de horas trabalhadas
 *     tags: [HH-Registros]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, HHRegistroController.findAll);

/**
 * @swagger
 * /api/hh-registros/{id}:
 *   get:
 *     summary: Busca um registro de horas trabalhadas pelo ID
 *     tags: [HH-Registros]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authMiddleware, HHRegistroController.findById);

/**
 * @swagger
 * /api/hh-registros/{id}:
 *   put:
 *     summary: Atualiza um registro de horas trabalhadas
 *     tags: [HH-Registros]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
  authMiddleware,
  [
    body('funcionario_id').optional().isNumeric().withMessage('ID do funcionário deve ser um número'),
    body('obra_id').optional().isNumeric().withMessage('ID da obra deve ser um número'),
    body('horas_normais').optional().isNumeric().withMessage('Quantidade de horas normais deve ser um número'),
    body('horas_60').optional().isNumeric().withMessage('Quantidade de horas 60% deve ser um número'),
    body('horas_100').optional().isNumeric().withMessage('Quantidade de horas 100% deve ser um número')
  ],
  HHRegistroController.update
);

/**
 * @swagger
 * /api/hh-registros/{id}:
 *   delete:
 *     summary: Remove um registro de horas trabalhadas
 *     tags: [HH-Registros]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, HHRegistroController.delete);

/**
 * @swagger
 * /api/hh-registros/relatorio/obra/{obra_id}:
 *   get:
 *     summary: Gera um relatório de custos de HH por obra
 *     tags: [HH-Registros]
 *     security:
 *       - bearerAuth: []
 */
router.get('/relatorio/obra/:obra_id', authMiddleware, HHRegistroController.gerarRelatorioPorObra);

module.exports = router; 