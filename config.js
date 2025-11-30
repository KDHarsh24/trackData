require('dotenv').config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB Configuration
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/tracker';

// IP Lookup Configuration
const USE_IPAPI = (process.env.USE_IPAPI || 'true').toLowerCase() === 'true';
const IPAPI_URL = process.env.IPAPI_URL || 'https://ipapi.co/{ip}/json/';

module.exports = {
  PORT,
  NODE_ENV,
  MONGO_URI,
  USE_IPAPI,
  IPAPI_URL
};
