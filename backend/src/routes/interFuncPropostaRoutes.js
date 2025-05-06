const express = require('express');
const InterFuncPropostaController = require('../controllers/interFuncPropostaController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /api/func-propostas:
 *   get:
 *     summary: Lista todas as relações entre funcionários e propostas
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authMiddleware, InterFuncPropostaController.findAll);

/**
 * @swagger
 * /api/func-propostas:
 *   post:
 *     summary: Cria uma nova relação entre funcionário e proposta
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  authMiddleware,
  [
    body('funcionario_id').isNumeric().withMessage('ID do funcionário é obrigatório'),
    body('proposta_id').isNumeric().withMessage('ID da proposta é obrigatório'),
    body('data_inicio').optional().isISO8601().withMessage('Data de início deve estar no formato ISO8601')
  ],
  InterFuncPropostaController.create
);

/**
 * @swagger
 * /api/func-propostas/{id}:
 *   put:
 *     summary: Atualiza uma relação entre funcionário e proposta
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', 
  authMiddleware,
  [
    body('funcionario_id').optional().isNumeric().withMessage('ID do funcionário deve ser um número'),
    body('proposta_id').optional().isNumeric().withMessage('ID da proposta deve ser um número'),
    body('data_inicio').optional().isISO8601().withMessage('Data de início deve estar no formato ISO8601'),
    body('data_fim').optional().isISO8601().withMessage('Data de fim deve estar no formato ISO8601')
  ],
  InterFuncPropostaController.update
);

/**
 * @swagger
 * /api/func-propostas/{id}:
 *   delete:
 *     summary: Remove uma relação entre funcionário e proposta
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authMiddleware, InterFuncPropostaController.delete);

/**
 * @swagger
 * /api/func-propostas/funcionario/{funcionarioId}/proposta/{propostaId}:
 *   get:
 *     summary: Busca uma relação específica entre funcionário e proposta
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.get('/funcionario/:funcionarioId/proposta/:propostaId', 
  authMiddleware, 
  InterFuncPropostaController.findByIds
);

/**
 * @swagger
 * /api/func-propostas/proposta/{propostaId}/funcionarios:
 *   get:
 *     summary: Lista todos os funcionários associados a uma proposta
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.get('/proposta/:propostaId/funcionarios', 
  authMiddleware, 
  InterFuncPropostaController.getFuncionariosByProposta
);

/**
 * @swagger
 * /api/func-propostas/funcionario/{funcionarioId}/propostas:
 *   get:
 *     summary: Lista todas as propostas associadas a um funcionário
 *     tags: [FuncionariosProposta]
 *     security:
 *       - bearerAuth: []
 */
router.get('/funcionario/:funcionarioId/propostas', 
  authMiddleware, 
  InterFuncPropostaController.getPropostasByFuncionario
);

module.exports = router; 