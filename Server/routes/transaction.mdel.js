import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.js';

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    transaction_type: {
        type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
        allowNull: false,
        validate: {
            isIn: [['IN', 'OUT', 'ADJUSTMENT']]
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notZero(value) {
                if (value === 0) {
                    throw new Error('Quantity cannot be zero');
                }
            }
        }
    },
    reference_number: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    transaction_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['product_id']
        },
        {
            fields: ['transaction_type']
        },
        {
            fields: ['transaction_date']
        },
        {
            fields: ['reference_number']
        }
    ]
});

export default Transaction;