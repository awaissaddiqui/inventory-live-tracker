import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Inventory = sequelize.define('Inventory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    current_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    reserved_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    available_stock: {
        type: DataTypes.VIRTUAL,
        get() {
            return this.current_stock - this.reserved_stock;
        }
    },
    last_updated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'inventory',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['product_id']
        },
        {
            fields: ['current_stock']
        }
    ],
    validate: {
        reservedNotGreaterThanCurrent() {
            if (this.reserved_stock > this.current_stock) {
                throw new Error('Reserved stock cannot be greater than current stock');
            }
        }
    },
    hooks: {
        beforeUpdate: (inventory, options) => {
            inventory.last_updated = new Date();
        }
    }
});

export default Inventory;