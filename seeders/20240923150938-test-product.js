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
    await queryInterface.bulkInsert('Products', [
      { name: '王品牛小排', price: 1600, available: true, category_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '黑松露紐約客牛排', price: 1800, available: true, category_id: 1, createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('Categories', [
      { name: '牛排', createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('Options', [
      { name: '三分熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '五分熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '七分熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '全熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('Option_Types', [
      { name: '熟度', createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('Product_Option_Types', [
      { product_id: 1, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { product_id: 2, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Options', null, {});
    await queryInterface.bulkDelete('Option_Types', null, {});
    await queryInterface.bulkDelete('Product_Option_Types', null, {});
  }
};
