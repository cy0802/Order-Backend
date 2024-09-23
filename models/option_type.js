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
      Option_Type.belongsTo(models.Product, {
        foreignKey: 'product_id'
      });
      Option_Type.hasMany(models.Option, {
        foreignKey: 'option_type_id'
      });
    }
  }
  Option_Type.init({
    name: DataTypes.STRING,
    product_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Option_Type',
  });
  return Option_Type;
};