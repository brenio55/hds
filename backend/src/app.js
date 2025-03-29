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
const pedidoLocacaoRoutes = require('./routes/pedidoLocacaoRoutes');
const custoObraRoutes = require('./routes/custoObraRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const pedidosConsolidadosRoutes = require('./routes/pedidosConsolidadosRoutes');
const faturamentoRoutes = require('./routes/faturamentoRoutes');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://82.25.71.53',
    'http://hdsservico.com.br',
    'https://hdsservico.com.br',
    'http://www.hdsservico.com.br',
    'https://www.hdsservico.com.br',
    'http://*.hdsservico.com.br',
    'https://*.hdsservico.com.br'
];

// Configuração do CORS
app.use(cors({
    origin: function(origin, callback) {
        // Permite requisições sem origin (como apps mobile ou ferramentas de API)
        if (!origin) return callback(null, true);
        
        // Verifica se o origin é um subdomínio de hdsservico.com.br
        const isHdsSubdomain = origin && (
            allowedOrigins.includes(origin) || 
            /^https?:\/\/([a-zA-Z0-9-]+\.)*hdsservico\.com\.br$/.test(origin)
        );
        
        if (isHdsSubdomain) {
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
app.use('/api/pedidos-locacao', pedidoLocacaoRoutes);
app.use('/api/custos-obra', custoObraRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/pedidos-consolidados', pedidosConsolidadosRoutes);
app.use('/api/faturamentos', faturamentoRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app; 