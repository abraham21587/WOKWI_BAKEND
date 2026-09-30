const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, default: 'Sin nombre' },
  date: { type: Date, default: Date.now },
  code: String,
  components: [mongoose.Schema.Types.Mixed],
  connections: [mongoose.Schema.Types.Mixed]
});

module.exports = mongoose.models.Circuit || mongoose.model('Circuit', schema);