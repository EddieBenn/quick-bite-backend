"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorInstance = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
const foodModel_1 = require("./foodModel");
class VendorInstance extends sequelize_1.Model {
}
exports.VendorInstance = VendorInstance;
VendorInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    salt: {
        type: sequelize_1.DataTypes.STRING,
    },
    restaurant_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    earnings: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    revenue: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    name_of_owner: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    company_name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "Password is required",
            },
            notEmpty: {
                msg: "Password is required",
            },
        },
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    phone_no: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    isAvailable: {
        type: sequelize_1.DataTypes.BOOLEAN,
    },
    role: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    cover_image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    orders: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    sequelize: config_1.db,
    tableName: 'Vendor'
});
VendorInstance.hasMany(foodModel_1.FoodInstance, { foreignKey: 'VendorId' });
foodModel_1.FoodInstance.belongsTo(VendorInstance, { foreignKey: 'VendorId' });
