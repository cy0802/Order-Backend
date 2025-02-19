const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/config/config.json')[env];
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const connections = {};

const getTenantConnection = async (hostname) => {
  if (!connections[hostname]) {
    connections[hostname] = {};
    const sequelize = new Sequelize(hostname, config.username, config.password, {
      host: config.host,
      dialect: config.dialect,
      logging: config.logging,
    });
    const modelFiles = fs
      .readdirSync(path.join(__dirname, 'models'))
      .filter(file => {
        return (
          file.indexOf('.') !== 0 &&
          file !== basename &&
          file.slice(-3) === '.js' &&
          file.indexOf('.test.js') === -1 &&
          file !== 'tenant.js' && 
          file !== 'index.js'
        );
      });
    modelFiles.forEach(file => {
      const model = require(path.join(__dirname, 'models', file))(sequelize, Sequelize.DataTypes);
      connections[hostname][model.name] = model;
    });

    Object.keys(connections[hostname]).forEach(modelName => {
      if (connections[hostname][modelName].associate) {
        connections[hostname][modelName].associate(connections[hostname]);
      }
    });

    try {
      await sequelize.authenticate();
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }

    connections[hostname].sequelize = sequelize;
    connections[hostname].Sequelize = Sequelize;
  }
  return connections[hostname];
};

module.exports = { getTenantConnection };
