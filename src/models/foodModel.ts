import {DataTypes, Model} from 'sequelize';
import {db} from '../config';


export interface FoodAttributes {
    id: string;
    order_count: number;
    name: string;
    date_created: Date;
    date_updated: Date;
    vendorId: string;
    price: number;
    food_image: string;
    ready_time: string;
    isAvailable: boolean;
    rating: number;
    description: string;
}

export class FoodInstance extends Model<FoodAttributes> {}

FoodInstance.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
    },
    order_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
 
   
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
              msg: "food name is required",
            },
          },
    },
    date_created: {
        type: DataTypes.DATE,
    },
date_updated: {
        type: DataTypes.DATE,
    },
    vendorId: {
        type: DataTypes.STRING,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: {
              msg: "price name is required",
            },
          },
    },
    food_image: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Food Image is required'
            }
        }
    },
    ready_time: {
        type: DataTypes.STRING,
        allowNull: false,
        validate:{
            notNull:{
                msg: 'Estimated ready Time required'
            },
        }
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

},{
    sequelize: db,
    tableName: 'Food'
}
)