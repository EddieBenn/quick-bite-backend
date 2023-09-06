"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSingleOrder = exports.earningsAndRevenue = exports.orderByFood = exports.vendorTotalEarnings = exports.vendorGetHisPopularFoods = exports.singleOrderDetails = exports.vendorAvailability = exports.vendorTotalRevenue = exports.vendorGetsOrderCount = exports.changeStatus = exports.DeleteAllFood = exports.DeleteSingleFood = exports.updateFood = exports.vendorGetsProfile = exports.vendorEditProfile = exports.vendorChangePassword = exports.vendorLogin = exports.vendorGetsSingleFood = exports.vendorgetsAllHisFood = exports.vendorcreatesFood = exports.registerVendor = exports.verifyVendor = void 0;
const uuid_1 = require("uuid");
const helpers_1 = require("../utils/helpers");
const helpers_2 = require("../utils/helpers");
const vendorModel_1 = require("../models/vendorModel");
const emailFunctions_1 = require("../utils/emailFunctions");
const config_1 = require("../config");
const validators_1 = require("../utils/validators");
const foodModel_1 = require("../models/foodModel");
const validators_2 = require("../utils/validators");
const bcrypt_1 = __importDefault(require("bcrypt"));
const orderModel_1 = require("../models/orderModel");
const verifyVendor = async (req, res, next) => {
    try {
        const regNo = req.body.regNo;
        if (!regNo) {
            return res.status(404).json({
                message: `Registration Number is required`,
            });
        }
        const validateRegNo = /^AC-\d{8}$/;
        if (!validateRegNo.test(regNo)) {
            return res.status(400).json({
                message: `${regNo} is not a valid registration number`,
            });
        }
        const verifiedRegNo = await (0, helpers_2.axiosVerifyVendor)(regNo);
        if (verifiedRegNo === "not found") {
            return res.status(404).json({
                message: `The business is not found`,
            });
        }
        const token = await (0, helpers_1.GenerateSignature)({
            regNo: verifiedRegNo.findCompany.reg_no,
            company_name: `${verifiedRegNo.findCompany.company_name}`,
        });
        return res.status(200).json({
            message: `${verifiedRegNo.findCompany.company_name} is verified`,
            company_name: `${verifiedRegNo.findCompany.company_name}`,
            registration_Number: `${verifiedRegNo.findCompany.reg_no}`,
            token,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal server error`,
        });
    }
};
exports.verifyVendor = verifyVendor;
const registerVendor = async (req, res, next) => {
    try {
        let newUser = req.body;
        const error = validators_1.zodSchema.safeParse(newUser);
        if (error.success === false) {
            res.status(400).send({
                error: error.error.issues[0].message,
            });
            return;
        }
        const id = (0, uuid_1.v4)();
        const userId = req.regNo;
        const compName = req.company_name;
        // const registeredBusiness = await axiosVerifyVendor(userId);
        const { email, phone_no, name_of_owner, restaurant_name, address, cover_image, } = req.body;
        const verifyIfVendorExistByEmail = (await vendorModel_1.VendorInstance.findOne({
            where: { email: email },
        }));
        const verifyIfVendorExistByRestaurantName = (await vendorModel_1.VendorInstance.findOne({
            where: { restaurant_name: restaurant_name },
        }));
        if (verifyIfVendorExistByEmail) {
            return res.status(400).json({
                message: `${email} is already in use`,
            });
        }
        if (verifyIfVendorExistByRestaurantName) {
            return res.status(400).json({
                message: `${restaurant_name} is already in use`,
            });
        }
        const salt = await (0, helpers_1.GenerateSalt)();
        const password = await (0, helpers_1.passWordGenerator)(phone_no);
        console.log("password is", password);
        const hash = await (0, helpers_1.hashPassword)(password, salt);
        const html = (0, emailFunctions_1.emailHtml)(email, password);
        const newVendor = (await vendorModel_1.VendorInstance.create({
            id,
            email,
            restaurant_name,
            name_of_owner,
            company_name: compName,
            password: hash,
            address,
            phone_no,
            earnings: 0,
            revenue: 0,
            isAvailable: true,
            role: "vendor",
            salt,
            cover_image: req.file.path,
            rating: 0,
            orders: 0,
        }));
        if (!newVendor) {
            return res.status(400).json({
                message: `Vendor's profile couldn't be created`,
            });
        }
        if (newVendor) {
            const vend = (await vendorModel_1.VendorInstance.findOne({
                where: { id: id },
            }));
            await (0, emailFunctions_1.sendmail)(config_1.GMAIL_USER, email, "Welcome", html);
            const token = await (0, helpers_1.GenerateSignature)({ email: vend.email, id: vend.id });
            res.cookie("token", token);
            return res.status(200).json({
                message: `Vendor created successfully`,
                vend,
                token,
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.registerVendor = registerVendor;
// Vendor Creates Food
const vendorcreatesFood = async (req, res, next) => {
    try {
        const vendorId = req.vendor.id;
        const { name, price, food_image, ready_time, description } = req.body;
        // const venid = vendorId
        const error = validators_1.validateFoodSchema.safeParse(req.body);
        if (error.success === false) {
            res.status(400).send({
                error: error.error.issues[0].message,
            });
            return;
        }
        const existingFood = (await foodModel_1.FoodInstance.findOne({
            where: { name: name },
        }));
        if (existingFood) {
            return res.send({
                message: `Food exists`,
            });
        }
        let foodid = (0, uuid_1.v4)();
        // Create a new food object
        const newFood = (await foodModel_1.FoodInstance.create({
            id: foodid,
            order_count: 0,
            name,
            date_created: new Date(),
            date_updated: new Date(),
            vendorId: vendorId,
            price,
            food_image: req.file.path,
            ready_time,
            isAvailable: true,
            rating: 0,
            description,
        }));
        // console.log(newFood.vendorId);
        if (newFood)
            return res
                .status(200)
                .json({ message: `Food created successfully`, newFood });
        return res.status(400).json({ message: `Unable to create` });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal Server Error.`,
        });
    }
};
exports.vendorcreatesFood = vendorcreatesFood;
// Vendor Get All Food
const vendorgetsAllHisFood = async (req, res, next) => {
    try {
        const vendorId = req.vendor.id;
        const allFood = await foodModel_1.FoodInstance.findAll({
            where: {
                vendorId: vendorId,
            },
        });
        const count = allFood.length;
        return res.status(200).json({
            allFood,
            count,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.vendorgetsAllHisFood = vendorgetsAllHisFood;
// Vendor Get Single Food
const vendorGetsSingleFood = async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const foodid = req.query.foodid;
        const food = (await foodModel_1.FoodInstance.findOne({
            where: { id: foodid, vendorId: vendorId },
        }));
        if (!food)
            return res.status(400).json({ message: `Unable to fetch food` });
        return res.status(200).json({
            message: `Here is your food`,
            food,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal server error`,
        });
    }
};
exports.vendorGetsSingleFood = vendorGetsSingleFood;
const vendorLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const validateVendor = validators_2.vendorLoginSchema.safeParse({ email, password });
        if (validateVendor.success === false) {
            return res.status(400).send({
                status: "error",
                method: req.method,
                message: validateVendor.error.issues,
            });
        }
        const vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { email: email },
        }));
        if (!vendor)
            return res.status(404).json({ message: `Vendor not found` });
        const validatePassword = await bcrypt_1.default.compare(password, vendor.password);
        const token = await (0, helpers_1.GenerateSignature)({
            email: vendor.email,
            id: vendor.id,
        });
        if (validatePassword) {
            return res.status(200).json({
                status: "Success",
                method: req.method,
                message: "Login successful",
                token,
                vendor,
            });
        }
        return res.status(404).json({ message: `Wrong Password` });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.vendorLogin = vendorLogin;
const vendorChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        console.log(req.body);
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: `Password Mismatch`,
            });
        }
        const vendorid = req.vendor.id;
        const vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: vendorid },
        }));
        const confirm = await bcrypt_1.default.compare(oldPassword, vendor.password);
        if (!confirm)
            return res.status(400).json({
                message: `Wrong Password`,
            });
        const token = await (0, helpers_1.GenerateSignature)({
            id: vendor.id,
            email: vendor.email,
        });
        res.cookie("token", token);
        const new_salt = await (0, helpers_1.GenerateSalt)();
        const hash = await (0, helpers_1.hashPassword)(newPassword, new_salt);
        const updatedPassword = (await vendorModel_1.VendorInstance.update({
            password: hash,
            salt: new_salt,
        }, { where: { id: vendorid } }));
        if (updatedPassword) {
            return res.status(200).json({
                message: "You have successfully changed your password",
                id: vendor.id,
                email: vendor.email,
                role: vendor.role,
                token,
            });
        }
        return res.status(400).json({
            message: "Unsuccessful, contact Admin",
            vendor,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.vendorChangePassword = vendorChangePassword;
const vendorEditProfile = async (req, res) => {
    try {
        const vend = req.vendor.id;
        const { email, restaurant_name, name_of_owner, address, phone_no } = req.body;
        //   const validateResult = updateSchema.validate(req.body, option);
        //   if (validateResult.error) {
        //     return res.status(400).json({
        //       Error: validateResult.error.details[0].message,
        //     });
        //   }
        const findVendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: vend },
        }));
        if (!findVendor)
            return res.status(404).json({ msg: `You cannot edit this profile` });
        // Create an object to store the fields that need to be updated
        const updatedFields = {};
        // // Check if email is provided and not empty, then add it to the updatedFields object
        if (email !== "") {
            updatedFields.email = email;
        }
        // Add other fields to the updatedFields object if they are provided and not empty
        if (restaurant_name !== "") {
            updatedFields.restaurant_name = restaurant_name;
        }
        if (name_of_owner !== "") {
            updatedFields.name_of_owner = name_of_owner;
        }
        if (address !== "") {
            updatedFields.address = address;
        }
        if (phone_no !== "") {
            updatedFields.phone_no = phone_no;
        }
        // Perform the update operation with the fields from updatedFields
        const rowsAffected = (await vendorModel_1.VendorInstance.update(updatedFields, {
            where: { id: vend },
        }));
        if (rowsAffected) {
            const vendor = (await vendorModel_1.VendorInstance.findOne({
                where: { id: vend },
            }));
            const token = await (0, helpers_1.GenerateSignature)({
                id: vendor.id,
                email: vendor.email,
            });
            res.cookie("token", token);
            const newVendor = (await vendorModel_1.VendorInstance.findOne({
                where: { id: vend },
            }));
            return res.status(200).json({
                message: "You have successfully updated your profile",
                newVendor,
            });
        }
        return res.status(400).json({
            message: "Error updating your profile",
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: `Internal Server Error` });
    }
};
exports.vendorEditProfile = vendorEditProfile;
const vendorGetsProfile = async (req, res) => {
    try {
        const userId = req.vendor.id;
        const vendor = await vendorModel_1.VendorInstance.findOne({ where: { id: userId } });
        if (!vendor)
            return res.status(404).json({ message: `Vendor not found` });
        let arr = [vendor];
        return res.status(200).json({ message: `Here is your profile`, vendor, arr });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: `Internal Server Error` });
    }
};
exports.vendorGetsProfile = vendorGetsProfile;
const updateFood = async (req, res) => {
    // console.log( JwtPayload)
    try {
        const id = req.vendor.id;
        const vendor = await vendorModel_1.VendorInstance.findOne({ where: { id: id } });
        const foodid = req.params.id;
        let { name, price, ready_time, description } = req.body;
        const updatedFields = {};
        let a;
        if (name !== "") {
            updatedFields.name = name;
        }
        if (price !== "") {
            updatedFields.price = Number(price);
            a = updatedFields.price;
        }
        if (ready_time !== "") {
            updatedFields.ready_time = ready_time;
        }
        if (description !== "") {
            updatedFields.description = description;
        }
        const rowsAffected = (await foodModel_1.FoodInstance.update(updatedFields, {
            where: { id: foodid },
        }));
        const token = await (0, helpers_1.GenerateSignature)({
            id: vendor.id,
            email: vendor.email,
        });
        return res.status(200).send({
            Status: "success",
            Method: req.method,
            message: `Food updated successfully`,
            rowsAffected,
            token
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).send({ message: "Internal Server Error" });
    }
};
exports.updateFood = updateFood;
const DeleteSingleFood = async (req, res) => {
    try {
        const id = req.vendor.id;
        const foodId = req.params.foodid;
        console.log(foodId);
        const food = await foodModel_1.FoodInstance.findOne({ where: { id: foodId } });
        if (!food)
            return res
                .status(404)
                .json({ message: `Food not found` });
        await foodModel_1.FoodInstance.destroy({ where: { id: foodId } });
        return res.status(200).json({ message: `Food was deleted successfully` });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: `Internal Server Error` });
    }
};
exports.DeleteSingleFood = DeleteSingleFood;
const DeleteAllFood = async (req, res) => {
    try {
        const food = await foodModel_1.FoodInstance.destroy({ truncate: true });
        return res.status(200).json({ message: `All vendors deleted successfully` });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: `Internal Server Error` });
    }
};
exports.DeleteAllFood = DeleteAllFood;
const changeStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel_1.OrderInstance.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        await order.markAsReady();
        return res.json({ message: "Order status updated to ready" });
    }
    catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.changeStatus = changeStatus;
const vendorGetsOrderCount = async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const vendorOrders = (await orderModel_1.OrderInstance.findAll({
            where: { vendorId: vendorId },
        }));
        const vendor = await vendorModel_1.VendorInstance.findOne({
            where: { id: vendorId },
        });
        const orders = vendorOrders.map((a) => a.food_items);
        const food1 = orders.map((a) => {
            return Object.values(a);
        });
        let foodArr = [];
        for (let i = 0; i < food1.length; i++) {
            foodArr = Object.values(food1[i]);
        }
        if (!vendorOrders) {
            return res.status(404).json({
                message: `Vendor order not found`,
            });
        }
        else if (vendorOrders) {
            const orderCount = vendorOrders.length;
            return res.status(200).json({
                message: `Vendor's order fetched`,
                orderCount,
                vendorOrders,
                orders,
                foodArr
            });
        }
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.vendorGetsOrderCount = vendorGetsOrderCount;
const vendorTotalRevenue = async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const vendorRevenue = await vendorModel_1.VendorInstance.findOne({
            where: { id: vendorId },
        });
        if (!vendorRevenue) {
            return res.status(404).json({
                message: `Vendor's total revenue cannot be fetched`,
            });
        }
        else if (vendorRevenue) {
            const totalRevenue = vendorRevenue.revenue;
            return res.status(200).json({
                message: `Vendor's total revenue fetched successfully`,
                totalRevenue,
            });
        }
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.vendorTotalRevenue = vendorTotalRevenue;
const vendorAvailability = async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const availableVendor = await vendorModel_1.VendorInstance.findOne({
            where: { id: vendorId },
        });
        if (!availableVendor) {
            return res.status(404).json({
                message: `Vendor not found`,
            });
        }
        else if (availableVendor) {
            try {
                const newAvailability = !availableVendor.isAvailable;
                // const updateVendor= await VendorInstance.update({isAvailable: true }, {where: {id: vendorId}})
                await vendorModel_1.VendorInstance.update({ isAvailable: newAvailability }, { where: { id: vendorId } });
                return res.status(200).json({
                    message: `Vendor availability status updated`,
                });
            }
            catch (err) {
                console.log(err);
                return res.status(500).json({ message: `Internal server error` });
            }
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: `Internal server error`,
        });
    }
};
exports.vendorAvailability = vendorAvailability;
const singleOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        // const orderDetails = await OrderInstance.findAll({
        //   where: { id: orderId },
        // });
        const orderDetails = await orderModel_1.OrderInstance.findOne({
            where: { id: orderId },
        });
        console.log('orderid', orderDetails);
        if (!orderDetails) {
            return res.status(404).json({
                message: `Order not found`,
            });
        }
        else if (orderDetails) {
            return res.status(200).json({
                status: "success",
                message: `Order details fetched`,
                data: orderDetails,
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.singleOrderDetails = singleOrderDetails;
const vendorGetHisPopularFoods = async (req, res) => {
    try {
        let totalFoods = [];
        const id = req.vendor.id;
        const vendorsFoods = (await foodModel_1.FoodInstance.findAll({
            where: { vendorId: id },
        }));
        if (vendorsFoods.length === 0)
            return res.status(400).json({ message: `No Foods found` });
        for (let key of vendorsFoods) {
            if (key.order_count >= 1) {
                totalFoods.push(key);
            }
        }
        if (totalFoods.length === 0)
            return res.status(400).json({ message: `No popular Foods found` });
        return res.status(200).json({
            message: `Popular Foods fetched`,
            totalFoods,
        });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: `Internal server error` });
    }
};
exports.vendorGetHisPopularFoods = vendorGetHisPopularFoods;
const vendorTotalEarnings = async (req, res) => {
    try {
        const vendorId = req.vendor.id;
        const vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: vendorId },
        }));
        if (!vendor) {
            return res.status(404).json({
                message: `Vendor's total earnings cannot be fetched`,
            });
        }
        else if (vendor) {
            const totalEarning = vendor.earnings;
            return res.status(200).json({
                message: `Vendor's total earnings fetched successfully`,
                totalEarning,
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: `Internal server error`,
        });
    }
};
exports.vendorTotalEarnings = vendorTotalEarnings;
const orderByFood = async (req, res) => {
    try {
        const vId = req.vendor.id;
        let vendorFoodArr = [];
        const vendorFoods = (await foodModel_1.FoodInstance.findAll({
            where: { vendorId: vId },
        }));
        if (vendorFoods.length === 0)
            return res.status(404).json({
                message: `Vendor has no food`,
            });
        for (let key of vendorFoods) {
            vendorFoodArr.push({ key, count: key.order_count });
        }
        return res.status(200).json({
            message: `Foods fetched by Orders`,
            vendorFoodArr,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.orderByFood = orderByFood;
const earningsAndRevenue = async (req, res) => {
    try {
        const id = req.vendor.id;
        const vendor = (await vendorModel_1.VendorInstance.findOne({
            where: { id: id },
        }));
        if (!vendor)
            return res.status(404).json({ message: `Details not fetched` });
        console.log(vendor.orders);
        const earningRevenueArray = [];
        earningRevenueArray.push({
            earnings: vendor.earnings,
            revenue: vendor.revenue,
        });
        return res.status(200).json({
            message: `Details fetched`,
            earningRevenueArray,
        });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({
            message: `Internal Server Error`,
        });
    }
};
exports.earningsAndRevenue = earningsAndRevenue;
const DeleteSingleOrder = async (req, res) => {
    try {
        const id = req.vendor.id;
        const orderid = req.params.orderid;
        const order = await orderModel_1.OrderInstance.findOne({ where: { id: orderid } });
        console.log(orderid);
        if (!order)
            return res
                .status(404)
                .json({ message: `Order not found` });
        await orderModel_1.OrderInstance.destroy({ where: { id: orderid } });
        return res.status(200).json({ message: `Order was deleted successfully` });
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: `Internal Server Error` });
    }
};
exports.DeleteSingleOrder = DeleteSingleOrder;
