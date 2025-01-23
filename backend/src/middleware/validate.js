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

module.exports = {
  validateRegister,
  validateLogin
}; 