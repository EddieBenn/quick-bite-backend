// import dotenv from "dotenv"



// dotenv.config()

// const {DEV_PORT} = process.env

// export default{
//     PORT:DEV_PORT
// }

// console.log("running in development mode")

import dotenv from "dotenv";

dotenv.config();

const { DEV_PORT, DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_PORT } =
    process.env;

export default {
    PORT: DEV_PORT,
    DB_HOST,
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    DB_PORT,
};

console.log("running in development mode");