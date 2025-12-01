const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const requestIp = require('request-ip');
const mongoose = require('mongoose');
const config = require('./config');
const path = require('path');
const trackRouter = require('./routes/track');
const sendMessageRouter = require('./routes/sendMessage');
const apiRouter = require('./routes/api');

console.log('Initializing Tracker Server...');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());

// console.log('Using MONGO_URI:', process.env.MONGO_URI || process.env.MONGO_URL || config.MONGO_URI);

let mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || config.MONGO_URI || 'mongodb://localhost:27017/tracker';
console.log('Using effective MONGO_URI (pre-processed):', process.env.MONGO_URI || process.env.MONGO_URL || config.MONGO_URI || '(default)');
// Force database name in URI if possible, or use dbName option
if (mongoUri.includes('mongodb.net') && !mongoUri.includes('/portfolio')) {
    if (mongoUri.includes('?')) {
        mongoUri = mongoUri.replace('?', '/portfolio?');
    } else {
        mongoUri += '/portfolio';
    }
}

console.log('Final mongoUri used to connect:', mongoUri);
mongoose.connect(mongoUri, {
    dbName: 'portfolio'
}).then(() => {
    console.log('MongoDB connected successfully');
    try{
        console.log('Mongoose connection name:', mongoose.connection.name);
        console.log('Mongoose connection readyState:', mongoose.connection.readyState);
        if (mongoose.connection.host) console.log('Mongoose host:', mongoose.connection.host);
        if (mongoose.connection.client && mongoose.connection.client.s && mongoose.connection.client.s.url) console.log('Driver URL:', mongoose.connection.client.s.url);
    }catch(e){/* ignore logging errors */}
}).catch(err => console.error('MongoDB connection error:', err));



// Mount routes
app.use('/track', trackRouter);
app.use('/send-message', sendMessageRouter);
app.use('/api', apiRouter);
app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

if (require.main === module) {
    app.listen(process.env.PORT || 3000, () => console.log(`Tracker server listening on port ${process.env.PORT || 3000}`));
}

module.exports = app;
