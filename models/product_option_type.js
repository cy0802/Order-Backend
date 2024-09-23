'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product_Option_Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product_Option_Type.init({
    product_id: DataTypes.INTEGER,
    option_type_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product_Option_Type',
  });
  return Product_Option_Type;
};