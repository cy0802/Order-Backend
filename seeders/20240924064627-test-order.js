'use strict';
const bcrypt = require('bcrypt');
require('dotenv').config();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const passwd = await bcrypt.hash('hi', process.env.JWT_SECRET)
    await queryInterface.bulkInsert('Users', [
      { name: '王曉明', password: passwd, phone: '0912345678', email: 'mingming@gmail.com', admin: false, createdAt: new Date(), updatedAt: new Date() },
      { name: '陳大明', password: passwd, phone: '0923456789', email: 'chen@gmail.com', admin: false, createdAt: new Date(), updatedAt: new Date() },
      { name: '李小美', password: passwd, phone: '0934567890', email: 'maylee@gmail.com', admin: true, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('Coupons', [
      { name: '單筆訂單九折', expire: new Date('2025-12-31'), type: 'percent_off', percent_off: 0.9, createdAt: new Date(), updatedAt: new Date() },
      { name: '折抵100元', expire: new Date('2025-12-31'), type: 'discount', discount: 100, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('User_Coupons', [
      { user_id: 1, coupon_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { user_id: 1, coupon_id: 2, order_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { user_id: 2, coupon_id: 2, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('Tables', [
      { handler_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { handler_id: 3, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('User_Tables', [
      { user_id: 1, table_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { user_id: 2, table_id: 2, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('Orders', [
      { table_id: 1, user_id: 1, serve_state: false, price: 1828, paid_state: true, handler_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { table_id: 2, user_id: 2, serve_state: true,  price: 1998, paid_state: true, handler_id: 3, createdAt: new Date(), updatedAt: new Date() },
    ])
    await queryInterface.bulkInsert('Order_Products', [
      { order_id: 1, product_id: 1, quantity: 1, serve_state: true, createdAt: new Date(), updatedAt: new Date() },
      { order_id: 1, product_id: 3, quantity: 1, serve_state: true, createdAt: new Date(), updatedAt: new Date() },
      { order_id: 2, product_id: 2, quantity: 1, serve_state: true, createdAt: new Date(), updatedAt: new Date() },
      { order_id: 2, product_id: 4, quantity: 1, serve_state: true, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('Order_Product_Options', [
      { order_product_id: 1, option_id: 3, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { order_product_id: 3, option_id: 2, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {})
    await queryInterface.bulkDelete('Orders', null, {})
    await queryInterface.bulkDelete('Order_Products', null, {})
    await queryInterface.bulkDelete('Order_Product_Options', null, {})
  }
};
