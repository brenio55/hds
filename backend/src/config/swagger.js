const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ERP API',
      version: '1.0.0',
      description: 'Documentação da API do ERP',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Arquivos que contêm anotações do Swagger
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Proposta:
 *       type: object
 *       required:
 *         - descricao
 *         - valor_final
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da proposta
 *         descricao:
 *           type: string
 *           description: Descrição detalhada da proposta
 *         data_criacao:
 *           type: string
 *           format: date
 *           description: Data de criação da proposta
 *         data_emissao:
 *           type: string
 *           format: date
 *           description: Data de emissão da proposta
 *         client_info:
 *           type: object
 *           description: Informações do cliente em formato JSON
 *         versao:
 *           type: number
 *           format: float
 *           description: Versão da proposta
 *         documento_text:
 *           type: string
 *           description: Texto do documento
 *         especificacoes_html:
 *           type: string
 *           description: Especificações em formato HTML
 *         afazer_hds:
 *           type: string
 *           description: Lista de tarefas da HDS em formato JSON
 *         afazer_contratante:
 *           type: string
 *           description: Lista de tarefas do contratante em formato JSON
 *         naofazer_hds:
 *           type: string
 *           description: Lista do que não será feito pela HDS em formato JSON
 *         valor_final:
 *           type: number
 *           format: float
 *           description: Valor final da proposta
 *         user_id:
 *           type: integer
 *           description: ID do usuário que criou a proposta
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data e hora de criação do registro
 */

module.exports = swaggerJsdoc(options); 