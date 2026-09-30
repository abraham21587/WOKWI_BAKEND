require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const circuitRoutes = require('./src/routes/circuitRoutes');

const { MONGODB_URI, JWT_SECRET, FRONTEND_URL = '', PORT = 3000 } = process.env;
if (!MONGODB_URI || !JWT_SECRET) {
  console.error('❌ Faltan las variables MONGODB_URI y/o JWT_SECRET');
  process.exit(1);
}

const allowed = FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);

const app = express();
app.set('trust proxy', 1); // necesario detrás del proxy de Render
app.use(helmet());
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json({ limit: '1mb' }));

const limiter = (limit) =>
  rateLimit({ windowMs: 15 * 60 * 1000, limit, standardHeaders: 'draft-7', legacyHeaders: false,
    message: { error: 'Demasiadas peticiones, intenta más tarde' } });

app.get('/', (req, res) => res.json({ status: 'ok', service: 'physics-cyber-lab-api' }));
app.use('/api/auth', limiter(20), authRoutes);
app.use('/api/circuits', limiter(300), circuitRoutes);

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));
app.use((err, req, res, next) => {
  if (err.code === 11000) return res.status(409).json({ error: 'Ese registro ya existe' });
  if (err.status && err.status < 500) return res.status(err.status).json({ error: 'Petición inválida' });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    app.listen(PORT, () => console.log(`⚡ API escuchando en el puerto ${PORT}`));
  })
  .catch((e) => {
    console.error('❌ Error de MongoDB:', e.message);
    process.exit(1);
  });