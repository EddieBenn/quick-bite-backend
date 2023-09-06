"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleVendor = exports.userGetsAllOrders = exports.userChangePassword = exports.userGetsNewFoods = exports.userEditProfile = exports.userMakeOrder = exports.userChangeOrderStatus = exports.userGetsPendingOrders = exports.userGetsReadyOrders = exports.userGetFulfilledOrders = exports.getSingleVendors = exports.getAllVendors = exports.userLogIn = exports.reSendOtp = exports.verifyOtp = exports.registerUser = exports.userGetPopularVendors = exports.userGetPopularFoods = exports.userGetsAllFoodByAVendor = exports.userGetsAllFoods = void 0;
const foodModel_1 = require("../models/foodModel");
const vendorModel_1 = require("../models/vendorModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const userModel_1 = require("../models/userModel");
const validators_1 = require("../utils/validators");
const helpers_1 = require("../utils/helpers");
const emailFunctions_1 = require("../utils/emailFunctions");
const orderModel_1 = require("../models/orderModel");
const sequelize_1 = require("sequelize");
const userGetsAllFoods = async (req, res) => {
    try {
        const allFoodarr = await foodModel_1.FoodInstance.findAll({});
        if (!allFoodarr)
            return res.status(404).json({ message: `Foods not found` });
        return res.status(200).json({
            message: `All foods fetched`,
            allFoodarr
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.userGetsAllFoods = userGetsAllFoods;
const userGetsAllFoodByAVendor = async (req, res) => {
    try {
        const vendorId = req.query.id;
        if (!vendorId) {
            return res
                .status(400)
                .json({ message: "vendorId is required in query parameters" });
        }
        const allFood = await foodModel_1.FoodInstance.findAll({ where: { vendorId } });
        if (allFood.length === 0) {
            return res
                .status(404)
                .json({ message: `Foods not found for the given vendorId` });
        }
        if (allFood) {
            return res.status(200).json({
                message: `All foods fetched for this vendor`,
                data: allFood,
            });
        }
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.userGetsAllFoodByAVendor = userGetsAllFoodByAVendor;
const userGetPopularFoods = async (req, res) => {
    try {
        let totalFoods = [];
        let foodCheck = [];
        const foods = await foodModel_1.FoodInstance.findAll({});
        for (let key of foods) {
            foodCheck.push(key);
            if (key.order_count >= 10) {
                totalFoods.push(key);
            }
        }
        if (foodCheck.length === 0)
            return res.status(400).json({ message: `No Foods found` });
        if (totalFoods.length === 0)
            return res.status(400).json({ message: `No popular Foods found` });
        return res.status(200).json({
            message: `Popular Foods fetched`,
            data: totalFoods,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.userGetPopularFoods = userGetPopularFoods;
const userGetPopularVendors = async (req, res) => {
    try {
        let totalVendors = [];
        let vendorsCheck = [];
        const vendors = await vendorModel_1.VendorInstance.findAll({});
        for (let key of vendors) {
            vendorsCheck.push(key);
            if (key.orders >= 10) {
                totalVendors.push(key);
            }
        }
        if (vendorsCheck.length === 0)
            return res.status(400).json({ message: `No vendors found` });
        if (totalVendors.length === 0)
            return res.status(400).json({ message: `No popular vendors found` });
        return res.status(200).json({
            message: `Popular Vendors fetched`,
            data: totalVendors,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.userGetPopularVendors = userGetPopularVendors;
const registerUser = async (req, res, next) => {
    try {
        const { email, firstname, lastname, password, confirm_password, address, phone_no, } = req.body;
        const userId = (0, uuid_1.v4)();
        //validate input
        if (password !== confirm_password)
            return res.status(400).json({ message: `Password Mismatch` });
        const error = validators_1.validateUserSchema.safeParse(req.body);
        if (error.success === false) {
            return res.status(400).send({
                status: "error",
                method: req.method,
                message: error.error.issues,
                //message: error.error.issues.map((a:any)=> a.message)
            });
        }
        //chech if user exist
        const userExist = await userModel_1.UserInstance.findOne({ where: { email: email } });
        const phoneExist = await userModel_1.UserInstance.findOne({
            where: { phone_no: phone_no },
        });
        if (userExist) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "user already exists",
            });
        }
        if (phoneExist) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "phone number exists",
            });
        }
        //encrypt password
        const userSalt = await (0, helpers_1.GenerateSalt)();
        const hashedPassword = await (0, helpers_1.hashPassword)(password, userSalt);
        //generate OTP
        const { otp, expiry } = (0, helpers_1.GenerateOTP)();
        //create user
        const user = (await userModel_1.UserInstance.create({
            email,
            firstname,
            lastname,
            address,
            phone_no,
            password: hashedPassword,
            salt: userSalt,
            id: userId,
            role: "user",
            otp: otp,
            otp_expiry: expiry,
            verified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        //mail otp to user
        (0, emailFunctions_1.mailUserOtp)({
            to: email,
            OTP: otp,
        });
        //generate token
        // const token = jwt.sign({id:user.id, email:user.email},`quickbite` )
        const token = await (0, helpers_1.GenerateSignature)({ email: email, id: userId });
        res.cookie("token", token);
        return res.status(200).json({
            status: "success",
            method: req.method,
            message: "user created successfuly",
            token,
            userDetails: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                address: user.address,
                phone_no: user.phone_no,
                id: user.id,
                role: user.role,
                otp: otp,
                otp_expiry: expiry,
                verified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(400).json({
            status: "error",
            method: req.method,
            message: error.message,
        });
    }
};
exports.registerUser = registerUser;
const verifyOtp = async (req, res, next) => {
    try {
        const otp = req.body.otp;
        const userId = req.user.payload.id;
        const user = (await userModel_1.UserInstance.findOne({
            where: { id: userId },
        }));
        if (user && user.otp === Number(otp) && user.otp_expiry > new Date()) {
            const newOtp = 108;
            await userModel_1.UserInstance.update({
                verified: true,
                otp: newOtp,
            }, { where: { id: userId } });
            return res.status(200).json({
                message: `Email verified, proceed to login`,
            });
        }
        if (user.otp !== Number(otp)) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "Invalid OTP",
            });
        }
        if (user.otp_expiry < new Date()) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "OTP expired",
            });
        }
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.verifyOtp = verifyOtp;
const reSendOtp = async (req, res, next) => {
    try {
        const userId = req.user.payload.id;
        const user = (await userModel_1.UserInstance.findOne({
            where: { id: userId },
        }));
        //generate OTP
        const { otp, expiry } = (0, helpers_1.GenerateOTP)();
        const updatedUser = (await userModel_1.UserInstance.update({
            otp,
            otp_expiry: expiry,
        }, { where: { id: user.id } }));
        if (updatedUser) {
            (0, emailFunctions_1.mailUserOtp)({
                to: user.email,
                OTP: otp,
            });
            return res
                .status(200)
                .json({ status: "success", message: `OTP regenerated` });
        }
        return res.status(400).json({ message: `Otp generation unsuccesful` });
    }
    catch (error) {
        return res.status(400).json({
            status: "error",
            method: req.method,
            message: error.message,
        });
    }
};
exports.reSendOtp = reSendOtp;
const userLogIn = async (req, res, next) => {
    try {
        //catch frontend data
        const { email, password } = req.body;
        //fetch user
        const user = (await userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        if (!user) {
            return res.status(404).json({
                status: "error",
                method: req.method,
                message: "user not found",
            });
        }
        if (user) {
            const validated = await bcrypt_1.default.compare(password, user.password);
            if (!validated) {
                return res.status(401).send({
                    status: "error",
                    method: req.method,
                    message: "email or password is incorect",
                });
            }
            //check verified
            //generate token
            const token = await (0, helpers_1.GenerateSignature)({ id: user.id, email: user.email });
            res.cookie("token", token);
            return res.status(200).json({
                status: "success",
                method: req.method,
                message: "Login Successful",
                data: user,
                token,
            });
        }
    }
    catch (error) {
        console.log(error.message);
        return res.status(400).json({
            status: "error",
            method: req.method,
            message: error.message,
        });
    }
};
exports.userLogIn = userLogIn;
const getAllVendors = async (req, res, next) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = parseInt(req.query.page);
            if (Number.isNaN(page)) {
                return res.status(400).json({
                    message: "Invalid page number",
                });
            }
        }
        const pageSize = 10;
        const offset = (page - 1) * pageSize;
        const vendors = await vendorModel_1.VendorInstance.findAll();
        const totalPages = Math.ceil(vendors.length / pageSize);
        if (page > totalPages) {
            page = totalPages;
        }
        const allVendors = vendors.slice(offset, page * pageSize);
        return res.status(200).json({
            allVendors,
            currentPage: page,
            totalPages,
        });
    }
    catch (err) {
        console.error("Error executing getUsers:", err);
        return res.status(500).json({
            Error: "Internal Server Error",
        });
    }
};
exports.getAllVendors = getAllVendors;
const getSingleVendors = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const vendor = await vendorModel_1.VendorInstance.findAll({ where: { id: vendorId } });
        if (!vendor) {
            return res.status(400).send({
                status: "error",
                method: req.method,
                message: "user not found",
            });
        }
        return res.status(200).json({
            status: "success",
            method: req.method,
            message: "retrievd vendor successfully",
            vendor,
        });
    }
    catch (err) {
        console.error("Error executing getUsers:", err);
        return res.status(500).json({
            Error: "Internal Server Error",
        });
    }
};
exports.getSingleVendors = getSingleVendors;
const userGetFulfilledOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const fulfilledOrders = await orderModel_1.OrderInstance.findAll({
            where: {
                userId: userId,
                status: "fulfilled",
            },
        });
        if (fulfilledOrders.length === 0) {
            return res
                .status(404)
                .json({ message: "No fulfilled orders found for the user" });
        }
        return res.status(200).json({
            message: "Fulfilled Orders fetched",
            fulfilledOrders,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error " });
    }
};
exports.userGetFulfilledOrders = userGetFulfilledOrders;
const userGetsReadyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const readyOrders = await orderModel_1.OrderInstance.findAll({
            where: {
                userId: userId,
                status: "ready",
            },
        });
        if (!readyOrders || readyOrders.length === 0) {
            return res
                .status(404)
                .json({ message: "No ready orders found for this user" });
        }
        return res.status(200).json({
            message: "Ready orders fetched",
            readyOrders,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.userGetsReadyOrders = userGetsReadyOrders;
const userGetsPendingOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const pendingOrders = await orderModel_1.OrderInstance.findAll({
            where: {
                userId: userId,
                status: "pending",
            },
        });
        if (!pendingOrders || pendingOrders.length === 0) {
            return res
                .status(404)
                .json({ message: "No pending orders found for this user" });
        }
        return res.status(200).json({
            message: "Pending orders fetched",
            pendingOrders,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.userGetsPendingOrders = userGetsPendingOrders;
const userChangeOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = (await orderModel_1.OrderInstance.findOne({
            where: { id: orderId },
        }));
        if (!order) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "order not found",
            });
        }
        if (order.status === "Ready") {
            const updatedOrder = (await orderModel_1.OrderInstance.update({ status: "Fulfilled" }, { where: { id: orderId } }));
            return res.status(200).json({
                status: "success",
                method: req.method,
                message: "order status updated successfully",
                updatedOrder,
            });
        }
        else {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "order status cannot be changed to Fulfilled",
            });
        }
    }
    catch (err) {
        console.error("Error updating order:", err);
        return res.status(500).json({
            Error: "Internal Server Error",
        });
    }
};
exports.userChangeOrderStatus = userChangeOrderStatus;
const userMakeOrder = async (req, res, next) => {
    try {
        const { items, cartTotal, address } = req.body;
        for (let i = 0; i < items.length; i++) {
            items[i].status = 'pending';
        }
        const userid = req.user.payload.id;
        const foodid = items[0].id;
        const food = (await foodModel_1.FoodInstance.findOne({
            where: { id: foodid },
        }));
        const vendor = await vendorModel_1.VendorInstance.findOne({
            where: { id: food.vendorId },
        }); //as unknown as VendorAttributes
        if (!vendor) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "vendor not found",
            });
        }
        vendor.orders += 1;
        let cartTotal2 = Number(cartTotal);
        vendor.revenue += Number(cartTotal2);
        let companyEarn = cartTotal2 * 0.07;
        let tax = cartTotal * 0.02;
        let deductions = companyEarn + tax;
        let vendorEarn = cartTotal2 - deductions;
        vendor.earnings += vendorEarn;
        await vendor.save();
        for (let i = 0; i < items.length; i++) {
            const foodInstance = await foodModel_1.FoodInstance.findOne({
                where: { id: items[i].id },
            });
            if (foodInstance) {
                foodInstance.order_count += 1;
                await foodInstance.save();
            }
        }
        const user = (await userModel_1.UserInstance.findOne({
            where: { id: userid },
        }));
        const userEmail = user.email;
        const vendorEmail = vendor.email;
        const orderId = (0, uuid_1.v4)();
        const order = (await orderModel_1.OrderInstance.create({
            id: orderId,
            food_items: items,
            amount: Number(cartTotal),
            vendorId: vendor.id,
            address: address,
            status: "pending",
            userId: userid,
            isPaid: true,
        }));
        if (order) {
            const vendor = await vendorModel_1.VendorInstance.findOne({ where: { id: order.vendorId } });
            (0, emailFunctions_1.mailOrder)(userEmail);
            (0, emailFunctions_1.mailVendorOrder)(vendorEmail);
            return res.status(200).json({
                message: `Order created succesfully`,
                order,
            });
        }
        return res.status(200).json({
            status: "failed",
            method: req.method,
            message: "order not created",
        });
    }
    catch (err) {
        console.error("Error making order:", err.message);
        return res.status(500).json({
            Error: "Internal Server Error",
        });
    }
};
exports.userMakeOrder = userMakeOrder;
const userEditProfile = async (req, res) => {
    try {
        const userId = req.user.payload.id;
        const { email, firstname, lastname, address, phone_no } = req.body;
        const user2 = (await userModel_1.UserInstance.findOne({
            where: { id: userId },
        }));
        if (!user2) {
            return res.status(400).json({
                status: "error",
                method: req.method,
                message: "user not found",
            });
        }
        // Create an Object to store the fields that need to be updated
        const updatedUserFields = {};
        // Check if the fields are empty and add them to the object
        if (email !== "") {
            updatedUserFields.email = email;
        }
        if (firstname !== "") {
            updatedUserFields.firstname = firstname;
        }
        if (lastname !== "") {
            updatedUserFields.lastname = lastname;
        }
        if (address !== "") {
            updatedUserFields.address = address;
        }
        if (phone_no !== "") {
            updatedUserFields.phone_no = phone_no;
        }
        // Update the User
        const updatedUser = (await userModel_1.UserInstance.update(updatedUserFields, {
            where: { id: userId },
        }));
        const user = (await userModel_1.UserInstance.findOne({
            where: { id: userId },
        }));
        console.log(user2);
        return res.status(200).json({
            status: "success",
            method: req.method,
            message: "user updated successfully",
            data: user,
        });
    }
    catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({
            Error: "Internal Server Error",
        });
    }
};
exports.userEditProfile = userEditProfile;
const userGetsNewFoods = async (req, res) => {
    try {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const recentFoods = await foodModel_1.FoodInstance.findAll({
            where: {
                date_created: {
                    [sequelize_1.Op.gte]: oneMonthAgo,
                },
            },
            order: [["createdAt", "DESC"]],
        });
        if (recentFoods.length === 0) {
            return res.status(404).json({ message: `No recent foods found` });
        }
        return res.status(200).json({
            messasge: `Recent foods fetched`,
            data: recentFoods,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.userGetsNewFoods = userGetsNewFoods;
const userChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: `Password Mismatch`,
            });
        }
        const userid = req.user.payload.id;
        const user = (await userModel_1.UserInstance.findOne({
            where: { id: userid },
        }));
        const confirm = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!confirm)
            return res.status(400).json({
                message: `Wrong Password`,
            });
        const token = await (0, helpers_1.GenerateSignature)({
            id: user.id,
            email: user.email,
        });
        //   res.cookie('token', token)
        const new_salt = await (0, helpers_1.GenerateSalt)();
        const hash = await (0, helpers_1.hashPassword)(newPassword, new_salt);
        const updatedPassword = (await userModel_1.UserInstance.update({
            password: hash,
            salt: new_salt,
        }, { where: { id: userid } }));
        if (updatedPassword) {
            return res.status(200).json({
                message: "You have successfully changed your password",
                id: user.id,
                email: user.email,
                role: user.role,
                token,
            });
        }
        return res.status(400).json({
            message: "Unsuccessful, contact Admin",
            user,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.userChangePassword = userChangePassword;
const userGetsAllOrders = async (req, res) => {
    try {
        const userId = req.user.payload.id;
        const userOrders = await orderModel_1.OrderInstance.findAll({ where: { userId: userId } });
        if (!userOrders) {
            return res.status(404).json({ message: `Orders not found` });
        }
        const arr = [];
        arr.push(userOrders);
        if (arr.length === 0) {
            return res.status(404).json({ message: `You do not have any orders` });
        }
        const orders = userOrders.map((a) => a.food_items);
        const food1 = orders.map((a) => {
            return Object.values(a);
        });
        let foodArr = [];
        for (let i = 0; i < food1.length; i++) {
            foodArr = Object.values(food1[i]);
        }
        return res.status(200).json({
            message: `All orders fetched`,
            data: foodArr,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.userGetsAllOrders = userGetsAllOrders;
const getSingleVendor = async (req, res, next) => {
    try {
        const vendorId = req.params.id;
        const vendor = await vendorModel_1.VendorInstance.findAll({ where: { id: vendorId } });
        if (!vendor) {
            return res.status(400).send({
                status: "error",
                method: req.method,
                message: "vendor not found"
            });
        }
        return res.status(200).json({
            status: "success",
            method: req.method,
            message: "retrievd vendor successfully",
            data: vendor[0],
        });
    }
    catch (err) {
        console.error("Error executing getUsers:", err);
        return res.status(500).json({
            Error: "Internal Server Error",
        });
    }
};
exports.getSingleVendor = getSingleVendor;
