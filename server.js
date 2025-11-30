const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const requestIp = require('request-ip');
const mongoose = require('mongoose');
const config = require('./config');
const trackRouter = require('./routes/track');

console.log('Initializing Tracker Server...');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());

// console.log('Using MONGO_URI:', process.env.MONGO_URI || process.env.MONGO_URL || config.MONGO_URI);
mongoose.connect(process.env.MONGO_URI || process.env.MONGO_URL || config.MONGO_URI || 'mongodb://localhost:27017/tracker').then(() => console.log('MongoDB connected successfully')).catch(err => console.error('MongoDB connection error:', err));

// Mount routes
app.use('/track', trackRouter);
app.get('/', (req, res) => res.send('Tracker server running'));

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log(`Tracker server listening on port ${process.env.PORT || 3000}`));
}

module.exports = app;
