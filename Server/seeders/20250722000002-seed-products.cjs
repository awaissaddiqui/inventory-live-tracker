'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('products', [
            {
                sku: 'LAPTOP001',
                name: 'MacBook Pro 13"',
                description: 'Apple MacBook Pro 13-inch with M2 chip',
                category_id: 1, // Electronics
                price: 1299.99,
                cost_price: 1000.00,
                unit: 'pcs',
                barcode: '123456789012',
                minimum_stock: 5,
                maximum_stock: 50,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                sku: 'PHONE001',
                name: 'iPhone 15',
                description: 'Apple iPhone 15 128GB',
                category_id: 1, // Electronics
                price: 799.99,
                cost_price: 650.00,
                unit: 'pcs',
                barcode: '123456789013',
                minimum_stock: 10,
                maximum_stock: 100,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                sku: 'TSHIRT001',
                name: 'Cotton T-Shirt',
                description: 'Premium cotton t-shirt in various colors',
                category_id: 2, // Clothing
                price: 29.99,
                cost_price: 15.00,
                unit: 'pcs',
                barcode: '123456789014',
                minimum_stock: 20,
                maximum_stock: 200,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('products', null, {});
    }
};