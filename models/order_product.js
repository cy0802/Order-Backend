'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order_Product.belongsTo(models.Order, {
        foreignKey: 'order_id'
      });
      Order_Product.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
      Order_Product.belongsToMany(models.Option, {
        through: models.Order_Product_Option,
        foreignKey: 'order_product_id',
        otherKey: 'option_id'
      });
    }
  }
  Order_Product.init({
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    number: DataTypes.INTEGER,
    served: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Order_Product',
  });
  return Order_Product;
};