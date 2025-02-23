// models/index.js
'use strict';

const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 先載入 Tenant
const Tenant = require(path.join(__dirname, 'tenant.js'))(sequelize, Sequelize.DataTypes);
db[Tenant.name] = Tenant;

// 再載入 Global_User
const Global_User = require(path.join(__dirname, 'global_user.js'))(sequelize, Sequelize.DataTypes);
db[Global_User.name] = Global_User;

// 設定關聯
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
