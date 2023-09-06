"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodInstance = void 0;
const sequelize_1 = require("sequelize");
const config_1 = require("../config");
class FoodInstance extends sequelize_1.Model {
}
exports.FoodInstance = FoodInstance;
FoodInstance.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        allowNull: false
    },
    order_count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: "food name is required",
            },
        },
    },
    date_created: {
        type: sequelize_1.DataTypes.DATE,
    },
    date_updated: {
        type: sequelize_1.DataTypes.DATE,
    },
    vendorId: {
        type: sequelize_1.DataTypes.STRING,
    },
    price: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
                msg: "price name is required",
            },
        },
    },
    food_image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Food Image is required'
            }
        }
    },
    ready_time: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Estimated ready Time required'
            },
        }
    },
    isAvailable: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    sequelize: config_1.db,
    tableName: 'Food'
});
