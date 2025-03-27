const PedidoCompraModel = require('../models/pedidoCompraModel');
const PedidoLocacaoModel = require('../models/pedidoLocacaoModel');
const ServicoModel = require('../models/servicoModel');
const PropostaModel = require('../models/propostaModel');
const FornecedorModel = require('../models/fornecedorModel');
const ClientInfoModel = require('../models/clientInfoModel');

class PedidosConsolidadosController {
  static async findAll(req, res) {
    try {
      // Busca todos os pedidos
      const [pedidosCompra, pedidosLocacao, servicos] = await Promise.all([
        PedidoCompraModel.findAll(),
        PedidoLocacaoModel.findAll(),
        ServicoModel.findAll()
      ]);

      // Coleta todos os IDs únicos
      const propostaIds = new Set();
      const fornecedorIds = new Set();
      const clientInfoIds = new Set();

      [...pedidosCompra, ...pedidosLocacao, ...servicos].forEach(pedido => {
        if (pedido?.proposta_id) propostaIds.add(pedido.proposta_id);
        if (pedido?.fornecedor_id || pedido?.fornecedores_id) {
          fornecedorIds.add(pedido.fornecedor_id || pedido.fornecedores_id);
        }
        if (pedido?.clientinfo_id || pedido?.clientInfo_id) {
          clientInfoIds.add(pedido.clientinfo_id || pedido.clientInfo_id);
        }
      });

      // Busca dados relacionados
      const [propostas, fornecedores, clientes] = await Promise.all([
        Promise.all([...propostaIds].map(id => PropostaModel.findById(id))),
        Promise.all([...fornecedorIds].map(id => FornecedorModel.findById(id))),
        Promise.all([...clientInfoIds].map(id => ClientInfoModel.findById(id)))
      ]);

      // Cria mapas para lookup rápido, filtrando valores nulos
      const propostaMap = new Map(propostas.filter(p => p).map(p => [p.id, p]));
      const fornecedorMap = new Map(fornecedores.filter(f => f).map(f => [f.id, f]));
      const clienteMap = new Map(clientes.filter(c => c).map(c => [c.id, c]));

      // Formata os pedidos de compra
      const pedidosCompraFormatados = pedidosCompra
        .filter(pedido => pedido) // Remove pedidos nulos
        .map(pedido => ({
          tipo: 'compra',
          ...pedido,
          proposta: propostaMap.get(pedido.proposta_id) || null,
          fornecedor: fornecedorMap.get(pedido.fornecedores_id) || null,
          cliente: clienteMap.get(pedido.clientinfo_id) || null
        }));

      // Formata os pedidos de locação
      const pedidosLocacaoFormatados = pedidosLocacao
        .filter(pedido => pedido)
        .map(pedido => ({
          tipo: 'locacao',
          ...pedido,
          proposta: propostaMap.get(pedido.proposta_id) || null,
          fornecedor: fornecedorMap.get(pedido.fornecedor_id) || null,
          cliente: clienteMap.get(pedido.clientInfo_id) || null
        }));

      // Formata os serviços
      const servicosFormatados = servicos
        .filter(servico => servico)
        .map(servico => ({
          tipo: 'servico',
          ...servico,
          proposta: propostaMap.get(servico.proposta_id) || null,
          fornecedor: fornecedorMap.get(servico.fornecedor_id) || null
        }));

      // Combina todos os pedidos
      const todosPedidos = [
        ...pedidosCompraFormatados,
        ...pedidosLocacaoFormatados,
        ...servicosFormatados
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      res.json({
        total: todosPedidos.length,
        pedidos: todosPedidos
      });
    } catch (error) {
      console.error('Erro ao buscar pedidos consolidados:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PedidosConsolidadosController; 