const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at' } });

// Text index for quick search across message fields
// Use `language_override: 'lang'` so a document field named `language`
// (e.g. 'en-US') isn't interpreted as a MongoDB language override.
MessageSchema.index(
  { name: 'text', email: 'text', message: 'text' },
  { default_language: 'english', language_override: 'lang' }
);

module.exports = mongoose.model('Message', MessageSchema, 'messages');
