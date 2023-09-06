"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderInstance = void 0;
// models/Order.ts
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
const userModel_1 = require("./userModel");
class OrderInstance extends sequelize_1.Model {
    markAsReady() {
        throw new Error("Method not implemented.");
    }
    static associate(models) {
        OrderInstance.belongsTo(models.User, { foreignKey: 'userId', as: 'User' });
    }
}
exports.OrderInstance = OrderInstance;
OrderInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
    },
    food_items: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: false,
    },
    address: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    amount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        references: {
            model: userModel_1.UserInstance,
            key: 'id',
        },
    },
    vendorId: {
        type: sequelize_1.DataTypes.STRING,
    },
    isPaid: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize: config_1.db,
    tableName: 'Orders',
});
exports.default = OrderInstance;
