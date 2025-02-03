import express from 'express';
import propostaRoutes from './routes/propostaRoutes';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/propostas', propostaRoutes);

// Rota de teste básica
app.get('/test', (req, res) => {
    console.log('Rota raiz de teste acessada');
    res.json({ message: 'API está funcionando!' });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Teste a API em: http://localhost:${PORT}/test`);
});

export default app; 