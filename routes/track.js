const express = require('express');
const UAParser = require('ua-parser-js');
const axios = require('axios');
const { lookupGeo } = require('../utils/geo');
const config = require('../config');
const db = require('../db');

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
      meta,
      timestamp: new Date().toISOString(),
      rawHeaders: config.NODE_ENV !== 'production' ? { host: req.headers.host } : undefined
    };

    // persist to Postgres if configured
    try {
      const inserted = await db.insertTrack(payload).catch((e) => { throw e; });
      if (inserted) payload._db = inserted;
    } catch (err){
      // warn but continue
      console.warn('Postgres insert failed', err && err.message);
    }
    // Return enriched payload so caller can inspect (or 201/204 if you prefer)
    res.status(201).json({ ok: true, payload });
  } catch (err){
    console.error('track error', err && err.stack || err);
    res.status(500).json({ ok: false, error: 'internal' });
  }
});

module.exports = router;
