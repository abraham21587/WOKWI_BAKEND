const mongoose = require('mongoose');
const Circuit = require('../models/Circuit');

exports.save = async (req, res) => {
  const { name, code, components, connections } = req.body;
  if (!Array.isArray(components) || !Array.isArray(connections))
    return res.status(400).json({ error: 'Se requieren components y connections (arrays)' });
  const c = await Circuit.create({ name, code, components, connections });
  res.status(201).json({ id: c._id, name: c.name, date: c.date });
};

exports.list = async (req, res) => {
  const list = await Circuit.find({}, 'name date').sort({ date: -1 }).limit(100).lean();
  res.json(list.map((c) => ({ id: c._id, name: c.name, date: c.date })));
};

exports.getById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(404).json({ error: 'Circuito no encontrado' });
  const c = await Circuit.findById(req.params.id).lean();
  if (!c) return res.status(404).json({ error: 'Circuito no encontrado' });
  res.json({ id: c._id, name: c.name, date: c.date, code: c.code, components: c.components, connections: c.connections });
};