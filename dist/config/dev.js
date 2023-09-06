"use strict";
// import dotenv from "dotenv"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config()
// const {DEV_PORT} = process.env
// export default{
//     PORT:DEV_PORT
// }
// console.log("running in development mode")
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DEV_PORT, DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } = process.env;
exports.default = {
    PORT: DEV_PORT,
    DB_HOST,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
};
console.log("running in development mode");
