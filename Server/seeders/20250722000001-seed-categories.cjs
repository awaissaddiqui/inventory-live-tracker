'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('categories', [
            {
                name: 'Electronics',
                description: 'Electronic devices and gadgets',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Clothing',
                description: 'Apparel and accessories',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Books',
                description: 'Books and educational materials',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                name: 'Home & Kitchen',
                description: 'Home appliances and kitchen items',
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('categories', null, {});
    }
};