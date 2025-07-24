'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true
            },
            password_hash: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            first_name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            last_name: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('admin', 'manager', 'user'),
                allowNull: false,
                defaultValue: 'user'
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                allowNull: false,
                defaultValue: 'active'
            },
            last_login: {
                type: Sequelize.DATE,
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

        // Create indexes
        await queryInterface.addIndex('users', ['username'], { unique: true });
        await queryInterface.addIndex('users', ['email'], { unique: true });
        await queryInterface.addIndex('users', ['role']);
        await queryInterface.addIndex('users', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};