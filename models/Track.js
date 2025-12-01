const mongoose = require('mongoose');

const TrackSchema = new mongoose.Schema({
  ip: String,
  geo: Object, // Store the full geo object
  userAgent: String,
  device: Object,
  os: Object,
  browser: Object,
  url: String,
  referrer: String,
  language: String,
  meta: Object, // Flexible field for extra metadata
  timestamp: { type: Date, default: Date.now },
  rawHeaders: Object
});

// Create a text index across common searchable fields so we can implement
// elastic-like searches via MongoDB text/regex queries.
TrackSchema.index({ ip: 'text', url: 'text', referrer: 'text', userAgent: 'text', language: 'text', meta: 'text' });

module.exports = mongoose.model('trackers', TrackSchema, 'trackers');
