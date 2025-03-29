const PedidoCompraModel = require('../models/pedidoCompraModel');
const PedidoLocacaoModel = require('../models/pedidoLocacaoModel');
const ServicoModel = require('../models/servicoModel');
const PropostaModel = require('../models/propostaModel');
const FornecedorModel = require('../models/fornecedorModel');
const ClientInfoModel = require('../models/clientInfoModel');

class PedidosConsolidadosController {
  static async findAll(req, res) {
    try {
      console.log('========== INÍCIO - PEDIDOS CONSOLIDADOS CONTROLLER ==========');
      console.log('Requisição recebida em /api/pedidos-consolidados');
      console.log('Query params:', req.query);
      console.log('Headers de autenticação:', req.headers.authorization ? 'Token presente' : 'Token ausente');
      
      // Inicializar arrays vazios para cada tipo de pedido
      let pedidosCompra = [];
      let pedidosLocacao = [];
      let servicos = [];
      
      // Buscar pedidos de compra com tratamento de erro isolado
      try {
        console.log('Buscando pedidos de compra...');
        pedidosCompra = await PedidoCompraModel.findAll();
        console.log(`Pedidos de compra encontrados: ${pedidosCompra?.length || 0}`);
      } catch (errorCompra) {
        console.error('ERRO ao buscar pedidos de compra, continuando com array vazio:', errorCompra.message);
        pedidosCompra = [];
      }
      
      // Buscar pedidos de locação com tratamento de erro isolado
      try {
        console.log('Buscando pedidos de locação...');
        pedidosLocacao = await PedidoLocacaoModel.findAll();
        console.log(`Pedidos de locação encontrados: ${pedidosLocacao?.length || 0}`);
      } catch (errorLocacao) {
        console.error('ERRO ao buscar pedidos de locação, continuando com array vazio:', errorLocacao.message);
        pedidosLocacao = [];
      }
      
      // Buscar serviços com tratamento de erro isolado
      try {
        console.log('Buscando serviços...');
        servicos = await ServicoModel.findAll();
        console.log(`Serviços encontrados: ${servicos?.length || 0}`);
      } catch (errorServicos) {
        console.error('ERRO ao buscar serviços, continuando com array vazio:', errorServicos.message);
        servicos = [];
      }
      
      // Inicializar coleções vazias para IDs
      const propostaIds = new Set();
      const fornecedorIds = new Set();
      const clientInfoIds = new Set();

      // Coleta todos os IDs únicos - com tratamento seguro para cada tipo
      console.log('Coletando IDs únicos para busca de dados relacionados...');
      
      // Processar pedidos de compra
      try {
        pedidosCompra.forEach(pedido => {
          if (!pedido) return;
          
          if (pedido.proposta_id) propostaIds.add(pedido.proposta_id);
          if (pedido.fornecedores_id) fornecedorIds.add(pedido.fornecedores_id);
          if (pedido.clientinfo_id) clientInfoIds.add(pedido.clientinfo_id);
        });
      } catch (error) {
        console.error('Erro ao processar IDs de pedidos de compra:', error.message);
      }
      
      // Processar pedidos de locação
      try {
        pedidosLocacao.forEach(pedido => {
          if (!pedido) return;
          
          if (pedido.proposta_id) propostaIds.add(pedido.proposta_id);
          if (pedido.fornecedor_id) fornecedorIds.add(pedido.fornecedor_id);
          if (pedido.clientInfo_id) clientInfoIds.add(pedido.clientInfo_id);
        });
      } catch (error) {
        console.error('Erro ao processar IDs de pedidos de locação:', error.message);
      }
      
      // Processar serviços - com tratamento seguro evitando erros com campo itens
      try {
        servicos.forEach(servico => {
          if (!servico) return;
          
          if (servico.proposta_id) propostaIds.add(servico.proposta_id);
          if (servico.fornecedor_id) fornecedorIds.add(servico.fornecedor_id);
        });
      } catch (error) {
        console.error('Erro ao processar IDs de serviços:', error.message);
      }

      console.log(`IDs de propostas encontrados: ${propostaIds.size}`, [...propostaIds]);
      console.log(`IDs de fornecedores encontrados: ${fornecedorIds.size}`, [...fornecedorIds]);
      console.log(`IDs de clientes encontrados: ${clientInfoIds.size}`, [...clientInfoIds]);

      // Busca dados relacionados - com tratamento de erros para continuar mesmo com falhas
      let propostas = [];
      let fornecedores = [];
      let clientes = [];
      
      // Buscar propostas
      try {
        console.log('Buscando propostas...');
        propostas = await Promise.all(
          [...propostaIds].map(async id => {
            try {
              return await PropostaModel.findById(id);
            } catch (error) {
              console.error(`Erro ao buscar proposta ID ${id}:`, error.message);
              return null;
            }
          })
        );
        console.log(`Propostas encontradas: ${propostas.filter(p => p).length}`);
      } catch (errorPropostas) {
        console.error('ERRO ao buscar propostas, continuando com array vazio:', errorPropostas.message);
        propostas = [];
      }
      
      // Buscar fornecedores
      try {
        console.log('Buscando fornecedores...');
        fornecedores = await Promise.all(
          [...fornecedorIds].map(async id => {
            try {
              return await FornecedorModel.findById(id);
            } catch (error) {
              console.error(`Erro ao buscar fornecedor ID ${id}:`, error.message);
              return null;
            }
          })
        );
        console.log(`Fornecedores encontrados: ${fornecedores.filter(f => f).length}`);
      } catch (errorFornecedores) {
        console.error('ERRO ao buscar fornecedores, continuando com array vazio:', errorFornecedores.message);
        fornecedores = [];
      }
      
      // Buscar clientes
      try {
        console.log('Buscando clientes...');
        clientes = await Promise.all(
          [...clientInfoIds].map(async id => {
            try {
              return await ClientInfoModel.findById(id);
            } catch (error) {
              console.error(`Erro ao buscar cliente ID ${id}:`, error.message);
              return null;
            }
          })
        );
        console.log(`Clientes encontrados: ${clientes.filter(c => c).length}`);
      } catch (errorClientes) {
        console.error('ERRO ao buscar clientes, continuando com array vazio:', errorClientes.message);
        clientes = [];
      }

      // Cria mapas para lookup rápido, filtrando valores nulos
      console.log('Criando mapas para lookup rápido...');
      const propostaMap = new Map(propostas.filter(p => p).map(p => [p.id, p]));
      const fornecedorMap = new Map(fornecedores.filter(f => f).map(f => [f.id, f]));
      const clienteMap = new Map(clientes.filter(c => c).map(c => [c.id, c]));

      console.log(`Mapa de propostas: ${propostaMap.size} itens`);
      console.log(`Mapa de fornecedores: ${fornecedorMap.size} itens`);
      console.log(`Mapa de clientes: ${clienteMap.size} itens`);

      // Arrays para armazenar os resultados formatados
      let pedidosCompraFormatados = [];
      let pedidosLocacaoFormatados = [];
      let servicosFormatados = [];

      // Formata os pedidos de compra - com tratamento de erro isolado
      try {
        console.log('Formatando pedidos de compra...');
        pedidosCompraFormatados = pedidosCompra
          .filter(pedido => pedido && pedido.id)
          .map(pedido => {
            try {
              return {
          tipo: 'compra',
                id: pedido.id,
                created_at: pedido.created_at,
                fornecedor_id: pedido.fornecedores_id,
                proposta_id: pedido.proposta_id,
                cliente_id: pedido.clientinfo_id,
          proposta: propostaMap.get(pedido.proposta_id) || null,
          fornecedor: fornecedorMap.get(pedido.fornecedores_id) || null,
                cliente: clienteMap.get(pedido.clientinfo_id) || null,
                ddl: pedido.ddl,
                data_vencimento: pedido.data_vencimento
              };
            } catch (error) {
              console.error(`Erro ao formatar pedido de compra ID=${pedido.id}:`, error.message);
              return {
                tipo: 'compra',
                id: pedido.id,
                error: true,
                created_at: pedido.created_at || new Date().toISOString()
              };
            }
          });
        console.log(`Pedidos de compra formatados: ${pedidosCompraFormatados.length}`);
      } catch (errorFormatCompra) {
        console.error('ERRO ao formatar pedidos de compra, continuando com array vazio:', errorFormatCompra.message);
        pedidosCompraFormatados = [];
      }

      // Formata os pedidos de locação - com tratamento de erro isolado
      try {
        console.log('Formatando pedidos de locação...');
        pedidosLocacaoFormatados = pedidosLocacao
          .filter(pedido => pedido && pedido.id)
          .map(pedido => {
            try {
              return {
          tipo: 'locacao',
                id: pedido.id,
                created_at: pedido.created_at,
                fornecedor_id: pedido.fornecedor_id,
                proposta_id: pedido.proposta_id,
                cliente_id: pedido.clientInfo_id,
          proposta: propostaMap.get(pedido.proposta_id) || null,
          fornecedor: fornecedorMap.get(pedido.fornecedor_id) || null,
                cliente: clienteMap.get(pedido.clientInfo_id) || null,
                data_vencimento: pedido.data_vencimento
              };
            } catch (error) {
              console.error(`Erro ao formatar pedido de locação ID=${pedido.id}:`, error.message);
              return {
                tipo: 'locacao',
                id: pedido.id,
                error: true,
                created_at: pedido.created_at || new Date().toISOString()
              };
            }
          });
        console.log(`Pedidos de locação formatados: ${pedidosLocacaoFormatados.length}`);
      } catch (errorFormatLocacao) {
        console.error('ERRO ao formatar pedidos de locação, continuando com array vazio:', errorFormatLocacao.message);
        pedidosLocacaoFormatados = [];
      }

      // Formata os serviços - com tratamento de erro isolado e simplificado
      try {
        console.log('Formatando serviços...');
        servicosFormatados = servicos
          .filter(servico => servico && servico.id)
          .map(servico => {
            try {
              // Simplificando os dados retornados para evitar problemas de serialização
              return {
          tipo: 'servico',
                id: servico.id,
                created_at: servico.created_at,
                fornecedor_id: servico.fornecedor_id,
                proposta_id: servico.proposta_id,
                data_vencimento: servico.data_vencimento,
          proposta: propostaMap.get(servico.proposta_id) || null,
                fornecedor: fornecedorMap.get(servico.fornecedor_id) || null,
                // Excluindo o campo 'itens' que pode estar causando problemas
                // itens: servico.itens
              };
            } catch (error) {
              console.error(`Erro ao formatar serviço ID=${servico.id}:`, error.message);
              return {
                tipo: 'servico',
                id: servico.id,
                error: true,
                created_at: servico.created_at || new Date().toISOString()
              };
            }
          });
        console.log(`Serviços formatados: ${servicosFormatados.length}`);
      } catch (errorFormatServicos) {
        console.error('ERRO ao formatar serviços, continuando com array vazio:', errorFormatServicos.message);
        servicosFormatados = [];
      }

      // Combina todos os pedidos com tratamento de erro
      console.log('Combinando todos os pedidos...');
      let todosPedidos = [];
      try {
        todosPedidos = [
          ...pedidosCompraFormatados,
          ...pedidosLocacaoFormatados,
          ...servicosFormatados
        ].sort((a, b) => {
          try {
            return new Date(b.created_at) - new Date(a.created_at);
          } catch (error) {
            console.error('Erro ao ordenar pedidos por data:', error.message);
            return 0; // Mantém a ordem atual em caso de erro
          }
        });
      } catch (errorCombine) {
        console.error('ERRO ao combinar pedidos, usando array simples:', errorCombine.message);
        todosPedidos = [
          ...pedidosCompraFormatados,
          ...pedidosLocacaoFormatados,
          ...servicosFormatados
        ];
      }

      // Aplicar filtros da query se existirem
      console.log('Verificando filtros da query:', req.query);
      const filtros = req.query;
      let pedidosFiltrados = [...todosPedidos];
      
      try {
        // Filtrar por tipo (material/compra, servico, locacao)
        if (filtros.tipo) {
          console.log(`Aplicando filtro por tipo: ${filtros.tipo}`);
          // Mapeamento para garantir compatibilidade entre front e back
          // Frontend pode enviar 'material' enquanto no backend é 'compra'
          const tipoEquivalente = (pedidoTipo, filtroTipo) => {
            if (filtroTipo === 'material' && pedidoTipo === 'compra') return true;
            if (filtroTipo === 'compra' && pedidoTipo === 'material') return true;
            return pedidoTipo === filtroTipo;
          };
          
          pedidosFiltrados = pedidosFiltrados.filter(pedido => {
            const match = tipoEquivalente(pedido.tipo, filtros.tipo);
            if (match) {
              console.log(`Pedido ${pedido.id} do tipo ${pedido.tipo} corresponde ao filtro ${filtros.tipo}`);
            }
            return match;
          });
          console.log(`Após filtro por tipo: ${pedidosFiltrados.length} pedidos`);
        }
        
        // Filtrar por ID específico
        if (filtros.id) {
          console.log(`Aplicando filtro por ID: ${filtros.id}`);
          pedidosFiltrados = pedidosFiltrados.filter(pedido => {
            const match = pedido.id.toString() === filtros.id.toString();
            if (match) {
              console.log(`Pedido ID ${pedido.id} corresponde ao filtro`);
            }
            return match;
          });
          console.log(`Após filtro por ID: ${pedidosFiltrados.length} pedidos`);
        }
        
        // Filtrar por proposta/centro de custo
        if (filtros.centroCusto) {
          console.log(`Aplicando filtro por centro de custo: ${filtros.centroCusto}`);
          pedidosFiltrados = pedidosFiltrados.filter(pedido => {
            const match = pedido.proposta_id && pedido.proposta_id.toString() === filtros.centroCusto.toString();
            if (match) {
              console.log(`Pedido ${pedido.id} com proposta ${pedido.proposta_id} corresponde ao filtro`);
            }
            return match;
          });
          console.log(`Após filtro por centro de custo: ${pedidosFiltrados.length} pedidos`);
        }
        
        // Usar os pedidos filtrados para o resto do processamento
        todosPedidos = pedidosFiltrados;
      } catch (errorFiltros) {
        console.error('ERRO ao aplicar filtros:', errorFiltros.message);
        // Em caso de erro nos filtros, manter todos os pedidos
      }

      console.log(`Total de pedidos consolidados após filtros: ${todosPedidos.length}`);
      console.log(`Pedidos de compra: ${pedidosCompraFormatados.length}`);
      console.log(`Pedidos de locação: ${pedidosLocacaoFormatados.length}`);
      console.log(`Pedidos de serviço: ${servicosFormatados.length}`);
      
      // Mostra exemplos dos pedidos encontrados
      if (todosPedidos.length > 0) {
        console.log('Exemplos de pedidos encontrados:');
        const exemplos = todosPedidos.slice(0, Math.min(3, todosPedidos.length));
        exemplos.forEach((pedido, index) => {
          console.log(`Pedido #${index + 1}: Tipo=${pedido.tipo}, ID=${pedido.id}, Data=${pedido.created_at}`);
        });
      } else {
        console.log('AVISO: Nenhum pedido encontrado!');
      }

      console.log('Enviando resposta...');
      
      // Criar um objeto mais simples para garantir serialização segura
      let pedidosSimplificados = [];
      try {
        // Garantir que cada pedido seja serializável
        pedidosSimplificados = todosPedidos.map(pedido => {
          try {
            const pedidoSeguro = {
              tipo: pedido.tipo || 'desconhecido',
              id: pedido.id || 0,
              data: pedido.created_at,
              status: pedido.error ? 'error' : 'ok'
            };
            
            // Adicionar campos de relação de forma segura
            if (pedido.fornecedor) {
              pedidoSeguro.fornecedor = {
                id: pedido.fornecedor.id,
                nome: pedido.fornecedor.razao_social
              };
            }
            
            if (pedido.proposta) {
              pedidoSeguro.proposta = {
                id: pedido.proposta.id,
                descricao: pedido.proposta.descricao
              };
            }
            
            if (pedido.data_vencimento) {
              pedidoSeguro.data_vencimento = pedido.data_vencimento;
            }
            
            // Adicionar campos específicos com base no tipo
            if (pedido.tipo === 'compra') {
              pedidoSeguro.cliente_id = pedido.cliente_id;
              pedidoSeguro.ddl = pedido.ddl;
            } else if (pedido.tipo === 'locacao') {
              pedidoSeguro.cliente_id = pedido.cliente_id;
            }
            
            return pedidoSeguro;
          } catch (e) {
            console.error('Erro ao serializar pedido:', e.message);
            return {
              tipo: pedido.tipo || 'desconhecido',
              id: pedido.id || 0,
              error: true,
              error_msg: 'Erro ao processar este pedido'
            };
          }
        });
        
        // Verificar se os dados podem ser serializados para JSON
        const jsonString = JSON.stringify({
            total: pedidosSimplificados.length,
            pedidos: pedidosSimplificados
        });
        
        console.log(`Resposta JSON gerada com sucesso, tamanho: ${jsonString.length} caracteres`);
        
        // Tentar fazer o parse novamente para garantir que não houve corrupção
        try {
            const testParse = JSON.parse(jsonString);
            console.log("Verificação de integridade do JSON: OK");
        } catch (parseError) {
            console.error("Falha na verificação de integridade do JSON:", parseError);
            throw new Error("JSON corrompido após serialização");
        }
        
        console.log("========== FIM - PEDIDOS CONSOLIDADOS CONTROLLER ==========");
        
        // Definir explicitamente o cabeçalho de conteúdo
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        
        // Verificar se res.json está disponível
        if (typeof res.json !== 'function') {
            console.error("Erro: res.json não é uma função!");
            // Fallback para res.send
            return res.send(jsonString);
        }
        
        return res.json({
            total: pedidosSimplificados.length,
            pedidos: pedidosSimplificados
        });
      } catch (error) {
        console.error("Erro ao serializar resposta para JSON:", error);
        console.log("========== FIM COM ERRO - PEDIDOS CONSOLIDADOS CONTROLLER ==========");
        
        // Garantir que o erro seja registrado em detalhes
        console.error("Stack trace:", error.stack);
        console.error("Mensagem de erro:", error.message);
        
        // Enviar resposta mínima com erro de maneira segura
        try {
            return res.status(500).json({
                total: 0,
                pedidos: [],
                erro: true,
                mensagem: "Erro ao processar dados para resposta: " + error.message
            });
        } catch (finalError) {
            // Se até mesmo o envio do erro falhar, usar res.send como último recurso
            console.error("Erro ao enviar resposta de erro:", finalError);
            return res.status(500).send('{"total":0,"pedidos":[],"erro":true,"mensagem":"Erro interno do servidor"}');
        }
      }
    } catch (error) {
      console.error('ERRO CRÍTICO ao buscar pedidos consolidados:', error);
      console.error('Stack trace:', error.stack);
      
      // Mesmo com erro, tenta retornar algo útil para o frontend
      res.status(500).json({ 
        error: error.message,
        message: "Ocorreu um erro ao buscar pedidos consolidados. Veja os logs do servidor para mais detalhes.",
        total: 0,
        pedidos: []
      });
    }
  }
}

module.exports = PedidosConsolidadosController; 