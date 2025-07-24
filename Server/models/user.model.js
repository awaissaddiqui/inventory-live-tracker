import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/sequelize.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 50],
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            len: [5, 100]
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    first_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            len: [1, 50],
            notEmpty: true
        }
    },
    last_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            len: [1, 50],
            notEmpty: true
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'manager', 'user'),
        allowNull: false,
        defaultValue: 'user'
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            unique: true,
            fields: ['username']
        },
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['role']
        },
        {
            fields: ['status']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash && !user.password_hash.startsWith('$2a$')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 12);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash') && !user.password_hash.startsWith('$2a$')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 12);
            }
        }
    }
});

// Essential instance methods only
User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

User.prototype.getFullName = function () {
    return `${this.first_name} ${this.last_name}`;
};

User.prototype.isAdmin = function () {
    return this.role === 'admin';
};

User.prototype.isManager = function () {
    return this.role === 'manager';
};

User.prototype.isActive = function () {
    return this.status === 'active';
};

User.prototype.updateLastLogin = async function () {
    this.last_login = new Date();
    return await this.save();
};

// Override toJSON to exclude sensitive data
User.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());

    // Remove sensitive data
    delete values.password_hash;

    // Add computed fields
    values.full_name = this.getFullName();

    return values;
};

// Static methods
User.findByEmail = function (email) {
    return this.findOne({ where: { email } });
};

User.findByUsername = function (username) {
    return this.findOne({ where: { username } });
};

export default User;
