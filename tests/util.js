const { execSync } = require('child_process');
const { Sequelize } = require("sequelize");
const jwt = require('jsonwebtoken');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const { QueryTypes } = require('sequelize');

const refreshDB = async () => {
  const conn = new Sequelize("tenant_db", config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
  });
  const hostnames = await conn.query("SELECT hostname FROM Tenants;", {
    type: QueryTypes.SELECT,
  });
  for (const item of hostnames) {
    await conn.query(`DROP DATABASE ${item.hostname};`);
  }
  await conn.close();
  const connectionString = `${config.dialect}://${config.username}:${config.password}@${config.host}/tenant_db`;
  execSync("npx sequelize-cli db:migrate:undo:all --migrations-path migrations/global --url " + connectionString);
  execSync("npx sequelize-cli db:migrate --migrations-path migrations/global --url " + connectionString);
}

const getCustomerToken = () => {
  return token = jwt.sign(
    { id: 1, name: "customer1", email: "customer1@gmail.com", permission: "customer" }, 
    process.env.JWT_SECRET, 
    { expiresIn: '3h' }
  );
}

const getClerkToken = () => {
  return token = jwt.sign(
    { id: 3, name: "clerk", email: "clerk@gmail.com", permission: "clerk" },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );
}

const getSysAdminToken = () => {
  return token = jwt.sign(
    { id: 5, name: "sysadmin", email: "sysadmin@gmail.com", permission: "sysadmin" },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );
}

const createTenant = async () => {
  const conn = new Sequelize("tenant_db", config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
  });
  await conn.query("CREATE DATABASE test_tenant;");
  await conn.query("INSERT INTO Tenants (hostname, createdAt, updatedAt) VALUES ('test_tenant', NOW(), NOW());");
  const connectionString = `${config.dialect}://${config.username}:${config.password}@${config.host}/test_tenant`;
  execSync("npx sequelize-cli db:migrate --migrations-path migrations/tenants --url " + connectionString);
  execSync("npx sequelize-cli db:seed:all --url " + connectionString);
}

module.exports = {
  refreshDB,
  getCustomerToken,
  getClerkToken,
  getSysAdminToken,
  createTenant
}