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
// NOTE: MongoDB treats a field named "language" as the text-search language
// override by default. If the app stores values like "en-IN", MongoDB will
// warn "language override unsupported: en-IN". To avoid that, do not use the
// field name `language` for language override. We exclude `language` from the
// text index and set a custom language_override option (looking for `lang`)
// so storing `language` in documents won't trigger the warning.
TrackSchema.index(
  { ip: 'text', url: 'text', referrer: 'text', userAgent: 'text', meta: 'text' },
  { name: 'TrackTextIndex', language_override: 'lang' }
);

module.exports = mongoose.model('trackers', TrackSchema, 'trackers');
