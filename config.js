require('dotenv').config();

const PORT = process.env.TRACK_PORT || 5000;
const TRUST_PROXY = (process.env.TRUST_PROXY || 'false').toLowerCase() === 'true';
const USE_IPAPI = (process.env.USE_IPAPI || 'true').toLowerCase() === 'true';
const IPAPI_URL = process.env.IPAPI_URL || 'https://ipapi.co/{ip}/json/';
const FORWARD_URL = process.env.FORWARD_URL || ''; // optional: forward enriched payload to another service

// Postgres configuration (from env)
// Support multiple common env var names: prefer a full connection string when present.
const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  null; // e.g. postgres://user:pass@host:port/dbname

// Individual pieces (fallback if no full URL provided)
const DB_HOST = process.env.DB_HOST || process.env.POSTGRES_HOST || null;
const DB_PORT = process.env.DB_PORT || process.env.POSTGRES_PORT || null;
const DB_USER = process.env.DB_USER || process.env.POSTGRES_USER || null;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || null;
const DB_NAME = process.env.DB_NAME || process.env.POSTGRES_DATABASE || null;
const DB_SSL = (process.env.DB_SSL || process.env.POSTGRES_SSL || 'false').toLowerCase() === 'true';

const NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = {
  PORT,
  TRUST_PROXY,
  USE_IPAPI,
  IPAPI_URL,
  FORWARD_URL,
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SSL,
  NODE_ENV,
};
