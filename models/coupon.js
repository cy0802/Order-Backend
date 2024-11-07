'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Coupon.belongsToMany(models.User, {
        through: models.User_Coupon,
        foreignKey: 'coupon_id',
        otherKey: 'user_id'
      });
      Coupon.belongsToMany(models.Order, {
        through: models.User_Coupon,
        foreignKey: 'coupon_id',
        otherKey: 'order_id'
      });
    }
  }
  Coupon.init({
    name: DataTypes.STRING,
    expire: DataTypes.DATE,
    type: DataTypes.STRING,
    percent_off: {
      allowNull: true,
      type: DataTypes.FLOAT
    },
    discount: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Coupon',
  });
  return Coupon;
};