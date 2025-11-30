const express = require('express');
const UAParser = require('ua-parser-js');
const axios = require('axios');
const { lookupGeo } = require('../utils/geo');
const config = require('../config');
const Track = require('../models/Track');

const router = express.Router();

// POST /track
router.post('/', async (req, res) => {
  try {
    const received = req.body || {};
    // Extract basic fields sent from client
    const userAgent = received.userAgent || req.headers['user-agent'] || '';
    const url = received.url || null;
    const referrer = received.referrer || req.headers.referer || null;
    const language = received.language || req.headers['accept-language'] || null;
    const meta = received.meta || {};
    // IP
    const ip = req.clientIp || (req.connection && req.connection.remoteAddress) || null;
    // UA parse
    const parser = new UAParser(userAgent);
    const uaResult = parser.getResult();

    // Geo lookup (server-side) - optional
    let geo = null;
    if (ip) {
      	geo = await lookupGeo(ip);
    }

    const payload = { 
      ip, 
      geo, 
      userAgent, 
      device: uaResult.device || {}, 
      os: uaResult.os || {},
      browser: uaResult.browser || {}, 
      url, 
      referrer, 
      language, 
	  timestamp: received.timestamp ? new Date(received.timestamp) : undefined,
      meta, 
      rawHeaders: config.NODE_ENV !== 'production' ? { host: req.headers.host } : undefined
    };

    // persist to MongoDB
    try {
      const newTrack = new Track(payload);
      const savedTrack = await newTrack.save();
      payload._db = savedTrack._id;
    } catch (err) {
      console.warn('MongoDB insert failed', err && err.message);
    }

    res.status(201).json({ ok: true, payload });
  } catch (err){
    console.error('track error', err && err.stack || err);
    res.status(500).json({ ok: false, error: 'internal' });
  }
});

module.exports = router;
