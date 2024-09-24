'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Item_Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Order_Item_Option.init({
    order_item_id: DataTypes.INTEGER,
    option_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Order_Item_Option',
  });
  return Order_Item_Option;
};