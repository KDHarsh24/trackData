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

module.exports = mongoose.model('tracker', TrackSchema, 'portfolio');
