'use strict';

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
    await queryInterface.bulkInsert('Users', [
      { name: '王曉明', password: 'hi', phone: '0912345678', email: 'mingming@gmail.com', admin: false, createdAt: new Date(), updatedAt: new Date() },
      { name: '陳大明', password: 'ji', phone: '0923456789', email: 'chen@gmail.com', admin: false, createdAt: new Date(), updatedAt: new Date() },
      { name: '李小美', password: 'ji', phone: '0934567890', email: 'maylee@gmail.com', admin: true, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('Orders', [
      { user_id: 1, price: 1828, paid: true, handler_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { user_id: 2, price: 1998, paid: true, handler_id: 3, createdAt: new Date(), updatedAt: new Date() },
    ])
    await queryInterface.bulkInsert('Order_Items', [
      { order_id: 1, product_id: 1, number: 1, served: true, createdAt: new Date(), updatedAt: new Date() },
      { order_id: 1, product_id: 3, number: 1, served: true, createdAt: new Date(), updatedAt: new Date() },
      { order_id: 2, product_id: 2, number: 1, served: true, createdAt: new Date(), updatedAt: new Date() },
      { order_id: 2, product_id: 4, number: 1, served: true, createdAt: new Date(), updatedAt: new Date() }
    ])
    await queryInterface.bulkInsert('Order_Item_Options', [
      { order_item_id: 1, option_id: 3, createdAt: new Date(), updatedAt: new Date() },
      { order_item_id: 3, option_id: 2, createdAt: new Date(), updatedAt: new Date() },
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
    await queryInterface.bulkDelete('Order_Items', null, {})
    await queryInterface.bulkDelete('Order_Item_Options', null, {})
  }
};
