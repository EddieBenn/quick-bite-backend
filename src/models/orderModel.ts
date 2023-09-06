// models/Order.ts
import { DataTypes, Model } from 'sequelize';
import { db } from '../config';
import { UserInstance } from './userModel';
import { FoodInstance } from './foodModel';


interface FoodDetails {
  name: string;
  description: string;
  id: string
  price: number
  quantity: number
  status: string
}

export interface OrderAttributes {
    id: string;
    food_items: FoodDetails[];
    amount: number;
    status: string;
    userId: string;
    vendorId: string;
    isPaid: boolean
    address: string
}

export class OrderInstance extends Model<OrderAttributes> {
  markAsReady() {
    throw new Error("Method not implemented.");
  }
  public static associate(models:{User: typeof UserInstance}): void{
    OrderInstance.belongsTo(models.User,{foreignKey:'userId', as:'User'})
  }
}

OrderInstance.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    food_items: {
        type: DataTypes.JSON,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
    userId: {
      type: DataTypes.UUID,
      references:{
        model: UserInstance,
        key:'id',

      },
    },
    vendorId: {
        type: DataTypes.STRING,
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
  },
  {
    sequelize: db,
    tableName: 'Orders',
  }
);

export default OrderInstance;


