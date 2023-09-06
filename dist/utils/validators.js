"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorLoginSchema = exports.validateFoodSchema = exports.validateUserSchema = exports.zodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.zodSchema = zod_1.default.object({
    email: zod_1.default.string({
        required_error: "Enter email"
    }),
    phone_no: zod_1.default.string({
        required_error: "Enter phone - number"
    }),
    name_of_owner: zod_1.default.string({
        required_error: "Enter the name of the owner"
    }),
    restaurant_name: zod_1.default.string({
        required_error: "Enter restaurant name"
    }),
    address: zod_1.default.string({
        required_error: "Enter address"
    }),
    // cover_image:  z.string({
    //   required_error: "Enter image"
    // }),
});
exports.validateUserSchema = zod_1.default.object({
    firstname: zod_1.default.string({ required_error: "firstname is required" }),
    lastname: zod_1.default.string({ required_error: "lastname is required" }),
    email: zod_1.default.string({ required_error: "email is required" }).email({ message: 'mail is invalid' }),
    password: zod_1.default.string({ required_error: "password is required" }).min(6),
    phone_no: zod_1.default.string({ required_error: "phone number is required" }).min(11),
    address: zod_1.default.string({ required_error: "address is required" })
});
exports.validateFoodSchema = zod_1.default.object({
    name: zod_1.default.string({ required_error: "food name is required" }),
    price: zod_1.default.string({ required_error: "food price is required" }),
    // food_image: z.string({required_error: "food image is required"}),
    ready_time: zod_1.default.string({ required_error: "ready time is required" }),
    description: zod_1.default.string({ required_error: "food description is required" }),
});
exports.vendorLoginSchema = zod_1.default.object({
    email: zod_1.default.string({ required_error: "email is required" }).email({ message: "invalid email" }),
    password: zod_1.default.string({ required_error: "password is required" })
});
