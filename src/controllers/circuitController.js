const mongoose = require('mongoose');
const Circuit = require('../models/Circuit');

const validate = (b = {}) => {
  const { name, code, components, connections } = b;
  if (!Array.isArray(components) || !Array.isArray(connections))
    return { error: 'Se requieren components y connections (arrays)' };
  if (components.length > 500 || connections.length > 2000)
    return { error: 'El circuito es demasiado grande' };
  if (name !== undefined && (typeof name !== 'string' || name.length > 100))
    return { error: 'Nombre inválido (máx. 100 caracteres)' };
  if (code !== undefined && (typeof code !== 'string' || code.length > 50000))
    return { error: 'Código inválido (máx. 50000 caracteres)' };
  return { data: { name: (name || 'Sin nombre').trim(), code: code || '', components, connections } };
};

const full = (c) => ({
  id: c._id, name: c.name, date: c.date, code: c.code,
  components: c.components, connections: c.connections
});
const notFound = (res) => res.status(404).json({ error: 'Circuito no encontrado' });

exports.save = async (req, res) => {
  const { data, error } = validate(req.body);
  if (error) return res.status(400).json({ error });
  const c = await Circuit.create({ ...data, owner: req.user.id });
  res.status(201).json({ id: c._id, name: c.name, date: c.date });
};

exports.list = async (req, res) => {
  const list = await Circuit.find({ owner: req.user.id }, 'name date').sort({ date: -1 }).limit(100).lean();
  res.json(list.map((c) => ({ id: c._id, name: c.name, date: c.date })));
};

exports.getById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
  const c = await Circuit.findOne({ _id: req.params.id, owner: req.user.id }).lean();
  if (!c) return notFound(res);
  res.json(full(c));
};

exports.update = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
  const { data, error } = validate(req.body);
  if (error) return res.status(400).json({ error });
  const c = await Circuit.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { ...data, date: new Date() },
    { new: true }
  ).lean();
  if (!c) return notFound(res);
  res.json({ id: c._id, name: c.name, date: c.date });
};

exports.remove = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
  const c = await Circuit.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!c) return notFound(res);
  res.json({ ok: true });
};