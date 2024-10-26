'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsTo(models.Category, {
        foreignKey: 'category_id'
      });
      Product.hasMany(models.Order_Product, {
        foreignKey: 'product_id'
      });
      Product.belongsToMany(models.Option_Type, {
        through: 'Product_Option_Type',
        foreignKey: 'product_id',
        otherKey: 'option_type_id'
      });
      Product.belongsToMany(models.Order, {
        through: 'Order_Product',
        foreignKey: 'product_id',
        otherKey: 'order_id'
      });
    }
  }
  Product.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER,
    available: DataTypes.BOOLEAN,
    category_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};