import Category from "./category.model.js";
import Product from "./product.model.js";
import Inventory from "./inventory.model.js";
import Transaction from "./transaction.model.js";
import User from "./user.model.js";

// Category - Product (One to Many)
Category.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

Product.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
});

// Product - Inventory (One to One)
Product.hasOne(Inventory, {
    foreignKey: 'product_id',
    as: 'inventory',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Inventory.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Product - Transaction (One to Many)
Product.hasMany(Transaction, {
    foreignKey: 'product_id',
    as: 'transactions',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

Transaction.belongsTo(Product, {
    foreignKey: 'product_id',
    as: 'product',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});

// Export all models
export {
    Category,
    Product,
    Inventory,
    Transaction,
    User
};

// Export default for easier importing
export default {
    Category,
    Product,
    Inventory,
    Transaction,
    User
};