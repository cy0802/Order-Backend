const db = require('../models');
const { execSync } = require('child_process');
const crypto = require('crypto');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const tenantDB = require('../db');

const Tenant = db.Tenant;

function randomHostname() {
  return crypto.randomBytes(4).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
}

async function getMetadata(req, res) {
  const Metadata = req.models.Metadata;
  try {
    const metadata = await Metadata.findAll({
      attributes: ['id', 'name', 'table_num', 'hostname'],
    });

    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function createTenant(req, res) {
  try {
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
  getMetadata,
  createTenant,
};