const db = require('../models');
const { execSync } = require('child_process');
const crypto = require('crypto');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const tenantDB = require('../db');

const Tenant = db.Tenant;

function randomHostname() {
  return crypto.randomBytes(32).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
}

async function createTenant(req, res) {
  try {
    // TODO: fix: sometimes generate 5 characters instead of 6
    const hostname = randomHostname();
    await db.sequelize.query(`CREATE DATABASE ${hostname};`);
    execSync(`sequelize db:migrate --migrations-path migrations/tenants --url ${config.dialect}://${config.username}:${config.password}@${config.host}/${hostname}`);
    
    const tenantDatabase = await tenantDB.getTenantConnection(hostname);
    await Tenant.create({ hostname });
    const Metadata = tenantDatabase.Metadata;
    const { name, table_num } = req.body;
    const metadata = await Metadata.create({ name, hostname, table_num });
    res.status(201).json(metadata); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createTenant,
};