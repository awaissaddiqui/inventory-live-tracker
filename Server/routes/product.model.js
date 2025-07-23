import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50]
        }
    },
    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 200]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    unit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pcs',
        validate: {
            isIn: [['pcs', 'kg', 'lbs', 'liter', 'meter', 'box', 'pack']]
        }
    },
    barcode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true
    },
    minimum_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    maximum_stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1000,
        validate: {
            min: 0
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['sku']
        },
        {
            unique: true,
            fields: ['barcode']
        },
        {
            fields: ['category_id']
        },
        {
            fields: ['is_active']
        }
    ],
    validate: {
        maximumGreaterThanMinimum() {
            if (this.maximum_stock <= this.minimum_stock) {
                throw new Error('Maximum stock must be greater than minimum stock');
            }
        }
    }
});

export default Product;