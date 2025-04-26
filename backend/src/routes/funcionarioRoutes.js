const express = require('express');
const FuncionarioController = require('../controllers/funcionarioController');
const authMiddleware = require('../middleware/auth');
const { body } = require('express-validator');

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
router.post('/', 
  authMiddleware, 
  [
    body('dados').isObject().withMessage('Dados do funcionário é obrigatório'),
    body('dados.nome').notEmpty().withMessage('Nome do funcionário é obrigatório'),
    body('cargo_id').optional().isNumeric().withMessage('ID do cargo deve ser um número')
  ],
  FuncionarioController.create
);

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
router.put('/:id', 
  authMiddleware, 
  [
    body('dados').optional().isObject().withMessage('Dados do funcionário deve ser um objeto'),
    body('cargo_id').optional().isNumeric().withMessage('ID do cargo deve ser um número')
  ],
  FuncionarioController.update
);

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

/**
 * @swagger
 * /api/funcionarios/{funcionarioId}/propostas:
 *   get:
 *     summary: Lista todas as propostas de um funcionário
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:funcionarioId/propostas', authMiddleware, FuncionarioController.listarPropostas);

/**
 * @swagger
 * /api/funcionarios/{funcionarioId}/propostas/{propostaId}:
 *   post:
 *     summary: Associa um funcionário a uma proposta
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:funcionarioId/propostas/:propostaId', 
  authMiddleware,
  [
    body('dataInicio').optional().isISO8601().withMessage('A data de início deve estar no formato ISO8601')
  ],
  FuncionarioController.associarProposta
);

/**
 * @swagger
 * /api/funcionarios/{funcionarioId}/propostas/{propostaId}:
 *   patch:
 *     summary: Desassocia um funcionário de uma proposta
 *     tags: [Funcionarios]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:funcionarioId/propostas/:propostaId', 
  authMiddleware,
  [
    body('dataFim').optional().isISO8601().withMessage('A data de fim deve estar no formato ISO8601')
  ],
  FuncionarioController.desassociarProposta
);

module.exports = router; 