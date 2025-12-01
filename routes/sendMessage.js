const express = require('express');
const Message = require('../models/Message');

const router = express.Router();

// POST /send-message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'name, email and message are required' });
    }

    const msg = new Message({ name, email, message });
    await msg.save();

    return res.status(201).json({ success: true, id: msg._id });
  } catch (err) {
    console.error('Error saving message:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
