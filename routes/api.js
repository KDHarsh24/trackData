const express = require('express');
const Message = require('../models/Message');
const Track = require('../models/Track');

const router = express.Router();

const mongoose = require('mongoose');

function parseIntParam(v, def) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : n;
}

// GET /api/messages?q=&sort=asc|desc&page=1&limit=20
router.get('/messages', async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const sortDir = req.query.sort === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const filter = q
      ? { $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { message: { $regex: q, $options: 'i' } }
        ] }
      : {};

    const total = await Message.countDocuments(filter);
    const data = await Message.find(filter).sort({ created_at: sortDir }).skip(skip).limit(limit);

    res.json({ total, page, limit, data });
  } catch (err) {
    console.error('GET /api/messages error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/trackers?q=&sort=asc|desc&page=1&limit=20
router.get('/trackers', async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const sortDir = req.query.sort === 'asc' ? 1 : -1;
    const skip = (page - 1) * limit;

    const filter = q
      ? { $or: [
          { ip: { $regex: q, $options: 'i' } },
          { url: { $regex: q, $options: 'i' } },
          { referrer: { $regex: q, $options: 'i' } },
          { userAgent: { $regex: q, $options: 'i' } },
          { language: { $regex: q, $options: 'i' } },
          { 'meta': { $regex: q, $options: 'i' } }
        ] }
      : {};

    const total = await Track.countDocuments(filter);
    const data = await Track.find(filter).sort({ timestamp: sortDir }).skip(skip).limit(limit);

    res.json({ total, page, limit, data });
  } catch (err) {
    console.error('GET /api/trackers error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/health - connection info for debugging
router.get('/health', (req, res) => {
  try {
    const conn = mongoose.connection;
    const info = {
      readyState: conn.readyState,
      name: conn.name || (conn.db && conn.db.databaseName) || null,
      host: conn.host || null,
      port: conn.port || null
    };
    res.json({ ok: true, connection: info });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

module.exports = router;

