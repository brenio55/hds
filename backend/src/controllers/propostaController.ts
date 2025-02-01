import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { prisma } from '../lib/prisma';

const propostaController = {
    searchPropostas: async (req: ExpressRequest, res: ExpressResponse) => {
        console.log('=== DEBUG PROPOSTA SEARCH ===');
        console.log('Query params:', req.query);
        console.log('URL:', req.url);
        console.log('Method:', req.method);
        console.log('Headers:', req.headers);
        console.log('==========================');

        try {
            const queryParams = req.query;
            let whereClause: any = {};
            
            // Se não houver parâmetros de busca, retorna todas as propostas
            if (Object.keys(queryParams).length === 0) {
                console.log('Buscando todas as propostas...');
                const propostas = await prisma.proposta.findMany({
                    orderBy: {
                        data_emissao: 'desc'
                    }
                });

                return res.json({
                    total: propostas.length,
                    propostas
                });
            }

            // Construir cláusula where baseada nos parâmetros recebidos
            Object.entries(queryParams).forEach(([key, value]) => {
                console.log(`Processando parâmetro: ${key} = ${value}`);
                if (typeof value === 'string') {
                    if (key.includes('client_info.')) {
                        const field = key.split('.')[1];
                        whereClause[`client_info`] = {
                            path: [`${field}`],
                            string_contains: value
                        };
                    } else {
                        whereClause[key] = {
                            contains: value,
                            mode: 'insensitive'
                        };
                    }
                }
            });

            console.log('Where clause construída:', whereClause);

            const propostas = await prisma.proposta.findMany({
                where: whereClause,
                orderBy: {
                    data_emissao: 'desc'
                }
            });

            console.log(`Encontradas ${propostas.length} propostas`);

            return res.json({
                total: propostas.length,
                propostas
            });
        } catch (error) {
            console.error('Erro ao pesquisar propostas:', error);
            return res.status(500).json({ error: 'Erro interno ao pesquisar propostas' });
        }
    }
};

export default propostaController; 