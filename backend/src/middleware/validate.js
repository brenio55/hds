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
  body('descricao')
    .isLength({ min: 10, max: 500 })
    .withMessage('Descrição deve ter entre 10 e 500 caracteres'),
  body('data_emissao')
    .optional()
    .isDate()
    .withMessage('Data de emissão deve ser uma data válida'),
  body('client_info')
    .optional()
    .isObject()
    .withMessage('Informações do cliente devem ser um objeto válido'),
  body('versao')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        value = value.replace(/\./g, '').replace(',', '.');
      }
      return !isNaN(parseFloat(value));
    })
    .withMessage('Versão deve ser um número decimal válido'),
  body('valor_final')
    .custom((value) => {
      if (typeof value === 'string') {
        // Remove pontos de milhar e substitui vírgula por ponto
        value = value.replace(/\./g, '').replace(',', '.');
      }
      const numero = parseFloat(value);
      return !isNaN(numero) && numero >= 0;
    })
    .withMessage('Valor final deve ser um número decimal válido e maior ou igual a zero')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateLogout,
  validateProposta
}; 