// filepath: d:\Client Projects\inventory-live-tracker\Server\migrations\20250722000003-create-inventory.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('inventory', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            product_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                unique: true,
                references: {
                    model: 'products',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            current_stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            reserved_stock: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            last_updated: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            location: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    async addIndex(queryInterface) {
        await queryInterface.addIndex('inventory', ['product_id'], {
            unique: true,
            name: 'idx_inventory_product_id'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('inventory');
    }
};