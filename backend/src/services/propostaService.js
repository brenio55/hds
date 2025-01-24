const PropostaModel = require('../models/propostaModel');

class PropostaService {
  static async create(propostaData) {
    try {
      return await PropostaModel.create(propostaData);
    } catch (error) {
      throw new Error('Erro ao criar proposta: ' + error.message);
    }
  }

  static async search(field, value) {
    try {
      const allowedFields = [
        'id', 'descricao', 'client_info', 'documento_text',
        'especificacoes_html', 'valor_final'
      ];

      if (!allowedFields.includes(field)) {
        throw new Error('Campo de busca inválido');
      }

      return await PropostaModel.findByField(field, value);
    } catch (error) {
      throw new Error('Erro ao buscar propostas: ' + error.message);
    }
  }
}

module.exports = PropostaService; 