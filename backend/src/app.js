const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const propostaRoutes = require('./routes/propostaRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const pedidoCompraRoutes = require('./routes/pedidoCompraRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/auth', authRoutes);
app.use('/api/propostas', propostaRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/pedidos-compra', pedidoCompraRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app; 