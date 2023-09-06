import {DataTypes, Model} from 'sequelize';
import {db} from '../config';


export interface UserAttributes {
    id?: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    password: string;
    address?: string;
    phone_no?: string;
    role?: string;
    salt?: string;
    otp?: number;
    otp_expiry?: Date;
    verified?: boolean;
    createdAt: Date,
    updatedAt: Date
}

export class UserInstance extends Model<UserAttributes> {}

UserInstance.init({
     id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false
},
email: {
    type: DataTypes.STRING,
    allowNull: false,
},
firstname: {
    type: DataTypes.STRING,
    allowNull: false,
},
lastname: {
    type: DataTypes.STRING,
    allowNull: false,
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
salt: {
    type: DataTypes.STRING,
},
phone_no: {
    type: DataTypes.STRING,
    allowNull: false
},
address:{
    type: DataTypes.STRING,
    allowNull: false
},
otp:{
    type: DataTypes.INTEGER
},
otp_expiry:{
    type: DataTypes.DATE
},
verified:{
    type: DataTypes.BOOLEAN
},
role:{
    type: DataTypes.STRING
},
createdAt: {
    type: DataTypes.DATE    
},
updatedAt: {
    type: DataTypes.DATE    
}

},{
    sequelize: db,
    tableName: 'User'
}
)