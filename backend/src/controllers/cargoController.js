const CargoModel = require('../models/cargoModel');
const { validationResult } = require('express-validator');

class CargoController {
  static async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const cargo = await CargoModel.create(req.body);
      res.status(201).json(cargo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const cargos = await CargoModel.findAll();
      res.json(cargos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const cargo = await CargoModel.findById(req.params.id);
      if (!cargo) {
        return res.status(404).json({ error: 'Cargo não encontrado' });
      }
      res.json(cargo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const cargo = await CargoModel.update(req.params.id, req.body);
      if (!cargo) {
        return res.status(404).json({ error: 'Cargo não encontrado' });
      }
      res.json(cargo);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const cargo = await CargoModel.delete(req.params.id);
      if (!cargo) {
        return res.status(404).json({ error: 'Cargo não encontrado' });
      }
      res.json({ message: 'Cargo removido com sucesso' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = CargoController; 