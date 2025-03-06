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
const pedidoLocacaoRoutes = require('./routes/pedidoLocacaoRoutes');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://82.25.71.53',
    'http://hdsservico.com.br',
    'https://hdsservico.com.br'
];

// Configuração do CORS
app.use(cors({
    origin: function(origin, callback) {
        // Permite requisições sem origin (como apps mobile ou ferramentas de API)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado pelo CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware para tratar preflight requests
app.options('*', cors());

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
app.use('/api/pedidos-locacao', pedidoLocacaoRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app; 