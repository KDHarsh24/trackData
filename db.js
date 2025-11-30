const { Pool } = require('pg');
const config = require('./config');

// create pg pool - prefer DATABASE_URL if provided (useful on Vercel/Heroku)
// Determine SSL option: accept insecure/self-signed certs when explicit or connection string requests SSL
let sslOption = false;
// allow forcing insecure SSL acceptance via env (opt-in)
const allowInsecure = (process.env.ALLOW_INSECURE_DB_SSL || '').toLowerCase() === 'true';
const dbUrl = config.DATABASE_URL || '';
// connection string may include sslmode=require; treat that as SSL needed
const wantsSslFromUrl = /sslmode=require/i.test(dbUrl) || /ssl=true/i.test(dbUrl);
// also detect common managed-host markers (supabase/pooler) as likely SSL-required
const wantsSslFromHost = /supabase\.co|pooler/i.test(dbUrl);
const wantsSsl = config.DB_SSL || wantsSslFromUrl || wantsSslFromHost || allowInsecure;
if (wantsSsl) sslOption = { rejectUnauthorized: false };

const poolConfig = config.DATABASE_URL
  ? { connectionString: config.DATABASE_URL, ssl: sslOption }
  : {
      host: config.DB_HOST,
      port: config.DB_PORT ? Number(config.DB_PORT) : undefined,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME,
      ssl: sslOption,
    };

// Log sanitized pool config (avoid printing secrets)
try {
  const safe = {
    connectionString: poolConfig.connectionString ? '[REDACTED]' : undefined,
    host: poolConfig.host,
    port: poolConfig.port,
    database: poolConfig.database,
    ssl: !!poolConfig.ssl,
  };
  if (config.NODE_ENV !== 'production') console.log('Postgres pool config', safe);
} catch (e) {}

let pgPool;
try {
  pgPool = new Pool(poolConfig);
} catch (err) {
  console.error('Failed to create Postgres pool', err && err.stack || err);
  throw err;
}

async function ensureTables(){
  const create = `
    CREATE TABLE IF NOT EXISTS tracks (
      id SERIAL PRIMARY KEY,
      ip TEXT,
      user_agent TEXT,
      url TEXT,
      referrer TEXT,
      language TEXT,
      meta JSONB,
      geo JSONB,
      device JSONB,
      os JSONB,
      browser JSONB,
      payload JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  try {
    await pgPool.query(create);
    if (config.NODE_ENV !== 'production') console.log('Postgres: ensured tracks table exists');
  } catch (err){
    console.error('Postgres ensureTables error', err && err.stack || err);
    throw err;
  }
}

async function insertTrack(payload){
  const insertSql = `
    INSERT INTO tracks (ip, user_agent, url, referrer, language, meta, geo, device, os, browser, payload)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING id, created_at
  `;
  const values = [
    payload.ip,
    payload.userAgent,
    payload.url,
    payload.referrer,
    payload.language,
    payload.meta || null,
    payload.geo || null,
    payload.device || null,
    payload.os || null,
    payload.browser || null,
    payload,
  ];
  const res = await pgPool.query(insertSql, values);
  return res.rows[0];
}

module.exports = { pgPool, ensureTables, insertTrack };
