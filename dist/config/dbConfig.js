"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_merge_1 = __importDefault(require("lodash.merge"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stage = process.env.NODE_ENV;
let config;
if (stage === "production") {
    config = require("./prod").default;
}
else if (stage === "development") {
    config = require("./dev").default;
}
else {
    config = null;
}
exports.default = (0, lodash_merge_1.default)({
    stage
}, config);
