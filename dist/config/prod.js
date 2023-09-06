"use strict";
// import dotenv from 'dotenv'
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config()
// const {PROD_PORT, DB_NAME} = process.env
// export default{
//     PORT:PROD_PORT,
//     DB_NAME: DB_NAME
// }
// console.log("running in production mode")
// //postgres://qfvlaudx:6i8aAY-doPNcsu4M_LruPoxNkED1S_Jc@surus.db.elephantsql.com/qfvlaudx
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { PROD_PORT, PROD_DB_HOST, PROD_DB_NAME, PROD_DB_USERNAME, PROD_DB_PASSWORD, DB_PORT } = process.env;
exports.default = {
    PORT: PROD_PORT,
    DB_NAME: PROD_DB_NAME,
    DB_HOST: PROD_DB_HOST,
    DB_USERNAME: PROD_DB_USERNAME,
    DB_PASSWORD: PROD_DB_PASSWORD,
    // DB_PORT,
};
console.log("running in production mode");
