'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Item extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order_Item.belongsTo(models.Order, {
        foreignKey: 'order_id'
      });
      Order_Item.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
      Order_Item.belongsToMany(models.Option, {
        through: models.Order_Item_Option,
      });
    }
  }
  Order_Item.init({
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    number: DataTypes.INTEGER,
    served: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Order_Item',
  });
  return Order_Item;
};