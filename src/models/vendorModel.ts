import {DataTypes, Model} from 'sequelize';
import {db} from '../config';
import {FoodInstance} from './foodModel';


export interface VendorAttributes {
    id: string;
    email?: string;
    restaurant_name?: string;
    name_of_owner?: string;
    company_name: string;
    password: string;
    address?: string;
    phone_no?: string;
    isAvailable: boolean;
    earnings: number;
    revenue: number;
    role: string;
    salt: string;
    cover_image?: string;
    rating: number;
    orders: number
}

export class VendorInstance extends Model<VendorAttributes> {
  orders: any;
  revenue: any;
  isAvailable: any;
}

VendorInstance.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    salt: {
        type: DataTypes.STRING,
    },
    restaurant_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    earnings: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    revenue: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    name_of_owner: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    password: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isAvailable: {
        type: DataTypes.BOOLEAN,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cover_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    orders: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }

},{
    sequelize: db,
    tableName: 'Vendor'
}
)

VendorInstance.hasMany(FoodInstance, {foreignKey:'VendorId' as 'Food'})
FoodInstance.belongsTo(VendorInstance, {foreignKey: 'VendorId' as 'Vendor'})