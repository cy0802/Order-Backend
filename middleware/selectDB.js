const db = require('../models');
const tenantDB = require('../db');

const Tenant = db.Tenant;

const selectDB = async (req, res, next) => {
  const hostname = req.hostname.split('.')[0];
  const tenant = await Tenant.findOne({ where: { hostname: hostname } });
  if (!tenant) {
    return res.status(404).send('Tenant not found');
  }
  const conn = await tenantDB.getTenantConnection(hostname);
  req.db = conn;
  next();
};

module.exports = selectDB;