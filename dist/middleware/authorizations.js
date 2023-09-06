"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorauth = exports.auth = exports.authForVerifiedVendor = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const vendorModel_1 = require("../models/vendorModel");
const authForVerifiedVendor = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (authorization === undefined) {
            return res.status(401).send({
                status: "error",
                data: "You are not authorised"
            });
        }
        const token = authorization.split(" ")[1];
        if (!token || token === "") {
            return res.status(401).send({
                status: "error",
                data: "access denied"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, `${process.env.APP_SECRET}`);
        if (!decoded)
            return res.status(401).send({
                status: "error",
                data: "You have not been verified"
            });
        req.regNo = decoded.payload.regNo;
        req.company_name = decoded.payload.company_name;
        return next();
    }
    catch (err) {
        console.log(err);
    }
};
exports.authForVerifiedVendor = authForVerifiedVendor;
const auth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (authorization === undefined) {
            return res.status(401).send({
                status: "There is an Error",
                message: "Ensure that you are logged in"
            });
        }
        const pin = authorization.split(" ")[1];
        if (!pin || pin === "") {
            return res.status(401).send({
                status: "Error",
                message: "The pin can't be used"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(pin, `${config_1.APP_SECRET}`);
        req.user = decoded;
        return next();
    }
    catch (err) {
        console.log("ERROR:", err);
        return res.status(401).send({
            status: "Error",
            message: err
        });
    }
};
exports.auth = auth;
const vendorauth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        if (authorization === undefined) {
            return res.status(401).send({
                status: "There is an Error",
                message: "Ensure that you are logged in"
            });
        }
        const pin = authorization.split(" ")[1];
        if (!pin || pin === "") {
            return res.status(401).send({
                status: "Error",
                message: "The pin can't be used"
            });
        }
        const decoded = jsonwebtoken_1.default.verify(pin, `${config_1.APP_SECRET}`);
        const vendor = await vendorModel_1.VendorInstance.findOne({ where: { id: decoded.payload.id },
        });
        if (vendor.role !== 'vendor')
            return res.status(400).json({ message: `You are not a vendor` });
        req.vendor = decoded.payload;
        // console.log( " valid vendor id",req.vendor)
        return next();
    }
    catch (err) {
        console.log(err.message);
    }
};
exports.vendorauth = vendorauth;
