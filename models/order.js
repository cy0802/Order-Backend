'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Order.belongsTo(models.User, {
        foreignKey: 'handler_id',
        as: 'handler'
      });
      Order.hasMany(models.Order_Item, {
        foreignKey: 'order_id'
      });
    }
  }
  Order.init({
    user_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    paid: DataTypes.BOOLEAN,
    handler_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};