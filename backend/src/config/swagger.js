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

module.exports = swaggerJsdoc(options); 