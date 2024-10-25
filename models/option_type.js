'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Option_Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Option_Type.hasMany(models.Option, {
        foreignKey: 'option_type_id'
      });
      Option_Type.belongsToMany(models.Product, {
        through: 'Product_Option_Type',
        foreignKey: 'option_type_id',
        otherKey: 'product_id'
      });
      Option_Type.belongsToMany(models.Order_Product, {
        through: 'Order_Product_Option',
        foreignKey: 'option_type_id',
        otherKey: 'order_product_id'
      });
    }
  }
  Option_Type.init({
    name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Option_Type',
  });
  return Option_Type;
};