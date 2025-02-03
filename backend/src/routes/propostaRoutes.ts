import { Router } from 'express';
import propostaController from '../controllers/propostaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

console.log('Configurando rotas de proposta...');

// Rota de teste
router.get('/test', (req, res) => {
    console.log('Rota de teste de proposta acessada');
    return res.json({ message: 'Rota de proposta funcionando!' });
});

// Rota para buscar propostas
router.get('/search', authMiddleware, propostaController.searchPropostas);

// Outras rotas de proposta...

console.log('Rotas de proposta configuradas');

export default router; 