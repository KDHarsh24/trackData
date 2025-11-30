const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const requestIp = require('request-ip');
const config = require('./config');
const trackRouter = require('./routes/track');
const db = require('./db');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(requestIp.mw());

// Mount routes
app.use('/track', trackRouter);

app.get('/', (req, res) => res.send('Tracker server running'));

app.listen(config.PORT, () => console.log(`Tracker server listening on port ${config.PORT}`));

// ensure tables on startup (best-effort)
db.ensureTables().catch((err) => {
  console.warn('Could not ensure Postgres tables on startup', err && err.message);
});
