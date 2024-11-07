'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Coupons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      expire: {
        type: Sequelize.DATE,
        allowNull: true, // null if the coupon never expires
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      percent_off: { // 0.1 = 10% off
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      discount: { // directly subtracted from the total price
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Coupons');
  }
};