const axios = require('axios');
const { USE_IPAPI, IPAPI_URL } = require('../config');

async function lookupGeo(ip){
  if (!ip) return null;
  if (!USE_IPAPI) return null;
  try {
    const url = IPAPI_URL.replace('{ip}', encodeURIComponent(ip));
    const res = await axios.get(url, { timeout: 2500 });
    if (res && res.data) return res.data;
  } catch (err){
    console.warn('IPAPI lookup failed', err && err.message);
  }
  return null;
}

module.exports = { lookupGeo };
