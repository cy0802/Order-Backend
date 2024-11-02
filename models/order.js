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
      Order.hasMany(models.Order_Product, {
        foreignKey: 'order_id'
      });
      Order.belongsTo(models.Table, {
        foreignKey: 'table_id'
      });
    }
  }
  Order.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    table_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    paid_state: DataTypes.BOOLEAN,
    serve_state: DataTypes.BOOLEAN,
    handler_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};