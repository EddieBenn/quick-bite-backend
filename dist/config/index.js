"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.DB_PORT = exports.DB_PASSWORD = exports.DB_USERNAME = exports.DB_NAME = exports.DB_HOST = exports.PORT = exports.APP_SECRET = exports.GMAIL_PASSWORD = exports.GMAIL_USER = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
const dbConfig_1 = __importDefault(require("./dbConfig"));
dotenv_1.default.config();
_a = process.env, exports.GMAIL_USER = _a.GMAIL_USER, exports.GMAIL_PASSWORD = _a.GMAIL_PASSWORD, exports.APP_SECRET = _a.APP_SECRET;
exports.PORT = dbConfig_1.default.PORT, exports.DB_HOST = dbConfig_1.default.DB_HOST, exports.DB_NAME = dbConfig_1.default.DB_NAME, exports.DB_USERNAME = dbConfig_1.default.DB_USERNAME, exports.DB_PASSWORD = dbConfig_1.default.DB_PASSWORD, exports.DB_PORT = dbConfig_1.default.DB_PORT;
//const DB_PORT = process.env.DB_PORT as unknown as number
exports.db = new sequelize_1.Sequelize(exports.DB_NAME, //name of database
exports.DB_USERNAME, //name of username
exports.DB_PASSWORD, //db password
{
    host: exports.DB_HOST,
    port: exports.DB_PORT,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        encrypt: true,
        //  ssl: {​​​​​​​
        //    rejectUnauthorized: false,
        //  }​​​​​​​,
    },
});
