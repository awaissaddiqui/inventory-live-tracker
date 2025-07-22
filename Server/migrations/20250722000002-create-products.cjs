// filepath: d:\Client Projects\inventory-live-tracker\Server\migrations\20250722000002-create-products.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('products', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            sku: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            name: {
                type: Sequelize.STRING(200),
                allowNull: false
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'categories',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT'
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00
            },
            cost_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true
            },
            unit: {
                type: Sequelize.STRING(20),
                allowNull: false,
                defaultValue: 'pcs'
            },
            barcode: {
                type: Sequelize.STRING(100),
                allowNull: true,
                unique: true
            },
            minimum_stock: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            maximum_stock: {
                type: Sequelize.INTEGER,
                defaultValue: 1000
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
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
        await queryInterface.addIndex('products', ['name'], {
            unique: true,
            name: 'idx_products_name'
        });
    },
    async addIndex(queryInterface) {
        await queryInterface.addIndex('products', ['category_id'], {
            name: 'idx_products_category_id'
        });
    },
    async addIndex(queryInterface) {
        await queryInterface.addIndex('products', ['sku'], {
            unique: true,
            name: 'idx_products_sku'
        });
    },


    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('products');
    }
};