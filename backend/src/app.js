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
const aluguelRoutes = require('./routes/aluguelRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const hhRegistroRoutes = require('./routes/hhRegistroRoutes');
const interFuncPropostaRoutes = require('./routes/interFuncPropostaRoutes');

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://hdsservico.com.br/',
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
	    console.log("problemas de cors")
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

// Aumentar limite de tamanho para processar JSON (para acomodar base64)
app.use(express.json({ limit: '50mb' }));

// Processar dados de formulário (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
app.use('/api/alugueis', aluguelRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/hh-registros', hhRegistroRoutes);
app.use('/api/func-propostas', interFuncPropostaRoutes);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

module.exports = app; 
