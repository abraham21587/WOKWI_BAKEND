const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const sign = (u) =>
  jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
const emailOk = (e) => typeof e === 'string' && e.length <= 100 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

exports.register = async (req, res) => {
  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 50)
    return res.status(400).json({ error: 'El nombre debe tener entre 2 y 50 caracteres' });
  if (!emailOk(email)) return res.status(400).json({ error: 'Correo inválido' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 72)
    return res.status(400).json({ error: 'La contraseña debe tener entre 8 y 72 caracteres' });

  const exists = await User.findOne({ email: email.trim().toLowerCase() });
  if (exists) return res.status(409).json({ error: 'Ese correo ya está registrado' });

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!emailOk(email) || typeof password !== 'string')
    return res.status(400).json({ error: 'Correo o contraseña inválidos' });

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

  res.json({ token: sign(user), user: publicUser(user) });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
  res.json({ user: publicUser(user) });
};