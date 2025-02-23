'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
module.exports = (sequelize, DataTypes) => {
  class Global_User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Global_User.belongsTo(models.Tenant, {
        foreignKey: 'tenant_id'
      });      
    }
    
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    generateToken() {
      return jwt.sign({
        id: this.id,
        name: this.name,
        email: this.email,
        // permission: this.permission
      }, process.env.JWT_SECRET, { expiresIn: '3h' });
    }
  }
  Global_User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    tenant_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    // phone: DataTypes.STRING,
    email: DataTypes.STRING,
    // permission: DataTypes.STRING,
    isTerminated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    sequelize,
    modelName: 'Global_User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          try {
            user.password = await bcrypt.hash(user.password, process.env.JWT_SECRET);
          } catch (error) {
            console.log(error);
          }
        }
      },
    }
  });
  return Global_User;
};