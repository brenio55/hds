const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const authRoutes = require('./routes/authRoutes');
const propostaRoutes = require('./routes/propostaRoutes');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const pedidoCompraRoutes = require('./routes/pedidoCompraRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');
const reembolsoRoutes = require('./routes/reembolsoRoutes');
const dividaRoutes = require('./routes/dividaRoutes');

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
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/reembolso', reembolsoRoutes);
app.use('/api/dividas', dividaRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app; 