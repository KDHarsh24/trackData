const express = require('express');
const Message = require('../models/Message');
const Track = require('../models/Track');

const router = express.Router();

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

    let filter = {};
    let projection = null;
    let sortObj = { timestamp: sortDir };

    if (q) {
      // Use MongoDB text search (backed by the TrackTextIndex which includes geo fields)
      filter = { $text: { $search: q } };
      projection = { score: { $meta: 'textScore' } };
      sortObj = { score: { $meta: 'textScore' }, timestamp: sortDir };
    }

    const total = await Track.countDocuments(filter);
    let query = Track.find(filter, projection).sort(sortObj).skip(skip).limit(limit);
    const data = await query.exec();

    res.json({ total, page, limit, data });
  } catch (err) {
    console.error('GET /api/trackers error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
