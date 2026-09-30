const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, default: 'Sin nombre', maxlength: 100 },
  date: { type: Date, default: Date.now },
  code: { type: String, default: '' },
  components: [mongoose.Schema.Types.Mixed],
  connections: [mongoose.Schema.Types.Mixed]
});

module.exports = mongoose.models.Circuit || mongoose.model('Circuit', schema);