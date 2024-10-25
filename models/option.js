'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Option.belongsTo(models.Option_Type, {
        foreignKey: 'option_type_id'
      });
      Option.belongsToMany(models.Order_Product, {
        through: models.Order_Product_Option,
        foreignKey: 'option_id',
        otherKey: 'order_product_id'
      });
    }
  }
  Option.init({
    name: DataTypes.STRING,
    option_type_id: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Option',
  });
  return Option;
};