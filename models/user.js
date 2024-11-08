'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Order, {
        foreignKey: 'user_id'
      });
      User.hasMany(models.Order, {
        foreignKey: 'handler_id'
      });
      User.hasMany(models.User_Coupon, {
        foreignKey: 'user_id'
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
        admin: this.admin
      }, process.env.JWT_SECRET, { expiresIn: '3h' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    admin: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'User',
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
  return User;
};