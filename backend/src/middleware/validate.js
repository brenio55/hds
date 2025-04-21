const { body } = require('express-validator');

const validateRegister = [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username deve ter no mínimo 3 caracteres'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('Role deve ser admin ou user')
];

const validateLogin = [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

const validateLogout = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório')
];

const validateProposta = [
  body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  body('valor_final')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Valor não pode ser vazio')
    .custom(value => {
      // Permite formatos: 1.234.567,89 ou 1,234
      // Converte para formato processável e verifica se é um número
      const valorProcessado = value.toString().replace(/\./g, '').replace(',', '.');
      if (isNaN(valorProcessado)) {
        throw new Error('Valor inválido');
      }
      return true;
    }),
  body('proposta_itens')
    .optional()
    .custom((value, { req }) => {
      if (value) {
        // Se é string, tenta fazer o parse
        let itens = value;
        if (typeof value === 'string') {
          try {
            itens = JSON.parse(value);
          } catch (e) {
            throw new Error('Lista de itens não é um JSON válido');
          }
        }

        // Verifica se é um array
        if (!Array.isArray(itens)) {
          throw new Error('Lista de itens deve ser um array');
        }

        // Valida cada item do array
        for (const item of itens) {
          if (!item.nome) {
            throw new Error('Todos os itens devem ter um nome');
          }
          
          // Validação de valores numéricos
          const valorUnitario = parseFloat(item.valor_unitario);
          if (isNaN(valorUnitario) || valorUnitario < 0) {
            throw new Error('Valor unitário deve ser um número positivo');
          }

          // Se valor_total não estiver definido, verifica se é possível calculá-lo
          if (!item.valor_total && (!item.qtdUnidades || !item.valor_unitario)) {
            throw new Error('Valor total ou (quantidade e valor unitário) devem ser informados');
          }
        }
      }
      return true;
    })
];

module.exports = {
  validateRegister,
  validateLogin,
  validateLogout,
  validateProposta
}; 