const express = require('express');
const PropostaController = require('../controllers/propostaController');
const { validateProposta } = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /propostas:
 *   post:
 *     summary: Cria uma nova proposta
 *     tags: [Propostas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - descricao
 *             properties:
 *               descricao:
 *                 type: string
 *               data_emissao:
 *                 type: string
 *                 format: date
 *               client_info:
 *                 type: object
 *               versao:
 *                 type: string
 *                 description: Número decimal (aceita formato 10.000 ou 0,25)
 *                 example: "10.000"
 *               valor_final:
 *                 type: string
 *                 description: Valor em formato decimal (aceita formato 10.000,50 ou 0,25)
 *                 example: "10.000,50"
 *               proposta_itens:
 *                 type: array
 *                 description: Lista de itens da proposta
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                       description: Nome do item
 *                     qtdUnidadeDeMedida:
 *                       type: string
 *                       description: Unidade de medida (ex: "VB", "UN", "M²")
 *                     qtdUnidades:
 *                       type: string
 *                       description: Quantidade
 *                     valor_unitario:
 *                       type: number
 *                       description: Valor unitário
 *                     valor_total:
 *                       type: number
 *                       description: Valor total (será calculado automaticamente se não fornecido)
 */
router.post('/', authMiddleware, validateProposta, PropostaController.create);

/**
 * @swagger
 * /propostas/{id}:
 *   put:
 *     summary: Atualiza uma proposta existente
 *     tags: [Propostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da proposta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao:
 *                 type: string
 *               data_emissao:
 *                 type: string
 *                 format: date
 *               client_info:
 *                 type: object
 *               versao:
 *                 type: string
 *               valor_final:
 *                 type: string
 *               proposta_itens:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                     qtdUnidadeDeMedida:
 *                       type: string
 *                     qtdUnidades:
 *                       type: string
 *                     valor_unitario:
 *                       type: number
 *                     valor_total:
 *                       type: number
 */
router.put('/:id', authMiddleware, validateProposta, PropostaController.update);

/**
 * @swagger
 * /propostas/search:
 *   get:
 *     summary: Busca propostas por campo
 *     tags: [Propostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: field
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: value
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/search', authMiddleware, PropostaController.search);

/**
 * @swagger
 * /propostas/{id}/pdf:
 *   post:
 *     summary: Gera um novo PDF para uma proposta existente
 *     tags: [Propostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da proposta
 *     responses:
 *       200:
 *         description: PDF gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 pdf_uid:
 *                   type: string
 *                 proposta:
 *                   $ref: '#/components/schemas/Proposta'
 */
router.post('/:id/pdf', authMiddleware, PropostaController.generatePdf);

/**
 * @swagger
 * /propostas/{id}/pdf/download:
 *   get:
 *     summary: Download do PDF da proposta
 *     tags: [Propostas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/pdf/download', authMiddleware, PropostaController.downloadPdf);

module.exports = router; 
