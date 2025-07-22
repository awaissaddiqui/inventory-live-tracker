'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('inventory', [
            {
                product_id: 1,
                current_stock: 25,
                reserved_stock: 5,
                last_updated: new Date(),
                location: 'Warehouse A - Shelf 1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 2,
                current_stock: 50,
                reserved_stock: 10,
                last_updated: new Date(),
                location: 'Warehouse A - Shelf 2',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_id: 3,
                current_stock: 100,
                reserved_stock: 0,
                last_updated: new Date(),
                location: 'Warehouse B - Shelf 1',
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('inventory', null, {});
    }
};