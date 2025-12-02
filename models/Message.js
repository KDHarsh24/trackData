const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at' } });

// Text index for quick search across message fields
MessageSchema.index({ name: 'text', email: 'text', message: 'text' });

module.exports = mongoose.model('Message', MessageSchema, 'messages');
