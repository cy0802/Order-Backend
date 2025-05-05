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
    await queryInterface.bulkInsert('Metadata', [
      { hostname: 'test_tenant', name: 'test_tenant', table_num: 3, createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('Products', [
      { 
        name: '王品牛小排', price: 1600, available: true, category_id: 1, createdAt: new Date(), updatedAt: new Date(),
        description: '王品獨具中式口味的牛小排，以特殊佐料醃浸兩天兩夜，再以 250°C 慢火烘烤一小時，盛裝於高溫瓷盤，保持牛排的香嫩風味。',
        image: 'WvB8FX3u42RkCIzNMinHUVDatYjpwlySZxb6AqLJ05rQPcTe7d.png'
      },
      { 
        name: '黑松露紐約客牛排', price: 1800, available: true, category_id: 1, createdAt: new Date(), updatedAt: new Date(),
        image: 'SYus0tkFN3IhnH2iGvPbQ9BTVlamXKOpcoqEdMwW5J68rjR1fC.png',
      },
      { 
        name: '香煎鴨腿佐羅美沙拉', price: 228, available: true, category_id: 2, createdAt: new Date(), updatedAt: new Date(), 
        image: 'HmZXKBESrs8d5hu1DTC26RPY0pItNLbl37WjMi9kgeQyUVzcFG.png',
      },
      { 
        name: '西瓜雪酪水果沙拉', price: 198, available: true, category_id: 2, createdAt: new Date(), updatedAt: new Date(),
        image: 'XRYPpSfTBt9Uhg0Oy51sFewanJcjkM2Hi63m7zADVvboZWNLqu.png',
      }
    ], {});
    await queryInterface.bulkInsert('Categories', [
      { name: '主餐', createdAt: new Date(), updatedAt: new Date() },
      { name: '沙拉', createdAt: new Date(), updatedAt: new Date() },
    ], {});
    await queryInterface.bulkInsert('Options', [
      { name: '三分熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '五分熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '七分熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '全熟', price: 0, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { name: '紅玉冷泡茶(冰)', price: 0, option_type_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: '鮮榨果汁(冰)', price: 0, option_type_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { name: '冰釀咖啡(冰)', price: 0, option_type_id: 2, createdAt: new Date(), updatedAt: new Date() },
    ], {});
    await queryInterface.bulkInsert('Option_Types', [
      { name: '熟度', createdAt: new Date(), updatedAt: new Date() },
      { name: "飲料", createdAt: new Date(), updatedAt: new Date() }
    ], {});
    await queryInterface.bulkInsert('Product_Option_Types', [
      { product_id: 1, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { product_id: 2, option_type_id: 1, createdAt: new Date(), updatedAt: new Date() },
      { product_id: 1, option_type_id: 2, createdAt: new Date(), updatedAt: new Date() },
      { product_id: 2, option_type_id: 2, createdAt: new Date(), updatedAt: new Date() },
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
