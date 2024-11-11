'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User_Coupon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User_Coupon.belongsTo(models.User, {
        foreignKey: 'user_id'
      });
      User_Coupon.belongsTo(models.Coupon, {
        foreignKey: 'coupon_id'
      });
    }
  }
  User_Coupon.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: DataTypes.INTEGER,
    coupon_id: DataTypes.INTEGER,
    order_id: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    used: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.order_id != null;
      }
    }
  }, {
    sequelize,
    modelName: 'User_Coupon',
  });
  return User_Coupon;
};