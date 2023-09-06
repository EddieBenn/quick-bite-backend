"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateOTP = exports.passWordGenerator = exports.checkPassword = exports.verifySignature = exports.GenerateSignature = exports.GenerateSignatureForVerify = exports.hashPassword = exports.GenerateSalt = exports.axiosVerifyVendor = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const axiosVerifyVendor = async (reg_numnber) => {
    try {
        const url = `https://business-name-verifier.onrender.com/company/getsingle?reg_number=${reg_numnber}`;
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        // Handle the error here
        if (error.response && error.response.status === 404) {
            return "not found"; // Return an empty array to indicate no data found
        }
        throw error; // Re-throw other errors
    }
};
exports.axiosVerifyVendor = axiosVerifyVendor;
const GenerateSalt = async () => {
    const saltRounds = 10;
    return await bcrypt_1.default.genSalt(saltRounds);
};
exports.GenerateSalt = GenerateSalt;
const hashPassword = async (password, salt) => {
    return await bcrypt_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const GenerateSignatureForVerify = async (regNo) => {
    const payload = { regNo };
    return jsonwebtoken_1.default.sign(payload, config_1.APP_SECRET, { expiresIn: '1h' });
};
exports.GenerateSignatureForVerify = GenerateSignatureForVerify;
const GenerateSignature = async (payload) => {
    return jsonwebtoken_1.default.sign({ payload }, `${config_1.APP_SECRET}`, { expiresIn: '10h' });
};
exports.GenerateSignature = GenerateSignature;
const verifySignature = async (signature) => {
    return jsonwebtoken_1.default.verify(signature, config_1.APP_SECRET);
};
exports.verifySignature = verifySignature;
const checkPassword = async (enteredPassword, savedPassword) => {
    return await bcrypt_1.default.compare(enteredPassword, savedPassword);
};
exports.checkPassword = checkPassword;
const passWordGenerator = async (phone_no) => {
    const passwordshuffle = phone_no.toString();
    let newShuffle = passwordshuffle.slice(-2);
    const mixup = newShuffle += Math.floor(100 + Math.random() * 9000);
    return mixup;
};
exports.passWordGenerator = passWordGenerator;
const GenerateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000));
    return { otp, expiry };
};
exports.GenerateOTP = GenerateOTP;
