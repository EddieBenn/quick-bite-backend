import merge from "lodash.merge"
import dotenv from "dotenv";
dotenv.config();

const stage:string = process.env.NODE_ENV!
let config;

if(stage === "production"){
    config = require("./prod").default
}else if (stage === "development") {
    config = require("./dev").default
} else {
    config = null
}

 

export default merge({
   stage
}, config)