require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const circuitRoutes = require('./src/routes/circuitRoutes');

const { MONGODB_URI, FRONTEND_URL = '', PORT = 3000 } = process.env;
if (!MONGODB_URI) {
  console.error('❌ Falta la variable MONGODB_URI');
  process.exit(1);
}

const allowed = FRONTEND_URL.split(',').map((s) => s.trim()).filter(Boolean);

const app = express();
app.use(cors({ origin: allowed.length ? allowed : true }));
app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'physics-cyber-lab-api' }));
app.use('/api/circuits', circuitRoutes);

app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
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