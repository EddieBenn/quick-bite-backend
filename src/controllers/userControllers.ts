import { FoodAttributes, FoodInstance } from "../models/foodModel";
import { VendorAttributes, VendorInstance } from "../models/vendorModel";
import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import jwt, { JwtPayload } from "jsonwebtoken";
import { APP_SECRET } from "../config";
import { UserInstance } from "../models/userModel";
import { UserAttributes } from "../models/userModel";
import { validateUserSchema } from "../utils/validators";
import {
  hashPassword,
  GenerateOTP,
  GenerateSignature,
  GenerateSalt,
} from "../utils/helpers";
import {
  mailUserOtp,
  mailOrder,
  mailVendorOrder,
} from "../utils/emailFunctions";
import { OrderAttributes, OrderInstance } from "../models/orderModel";
import { Op } from "sequelize";

export const userGetsAllFoods = async (req: JwtPayload, res: Response) => {
  try {
    const allFoodarr = await FoodInstance.findAll({});
    if (!allFoodarr) return res.status(404).json({ message: `Foods not found` });
    return res.status(200).json({
      message: `All foods fetched`,
      allFoodarr
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const userGetsAllFoodByAVendor = async (
  req: JwtPayload,
  res: Response
) => {
  try {
    const vendorId = req.query.id;

    if (!vendorId) {
      return res
        .status(400)
        .json({ message: "vendorId is required in query parameters" });
    }

    const allFood = await FoodInstance.findAll({ where: { vendorId } });

    if (allFood.length === 0) {
      return res
        .status(404)
        .json({ message: `Foods not found for the given vendorId` });
    }
    if (allFood) {
      return res.status(200).json({
        message: `All foods fetched for this vendor`,
        data:allFood,
      });
    }
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const userGetPopularFoods = async (req: Request, res: Response) => {
  try {
    let totalFoods = [];
    let foodCheck = [];
    const foods: any = await FoodInstance.findAll({});
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const userGetPopularVendors = async (req: Request, res: Response) => {
  try {
    let totalVendors = [];
    let vendorsCheck = [];
    const vendors: any = await VendorInstance.findAll({});
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      firstname,
      lastname,
      password,
      confirm_password,
      address,
      phone_no,
    } = req.body;
    const userId = v4();

    //validate input
    if (password !== confirm_password)
      return res.status(400).json({ message: `Password Mismatch` });

    const error = validateUserSchema.safeParse(req.body);
    if (error.success === false) {
      return res.status(400).send({
        status: "error",
        method: req.method,
        message: error.error.issues,
        //message: error.error.issues.map((a:any)=> a.message)
      });
    }

    //chech if user exist
    const userExist = await UserInstance.findOne({ where: { email: email } });
    const phoneExist = await UserInstance.findOne({
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
    const userSalt = await GenerateSalt();
    const hashedPassword = await hashPassword(password, userSalt);

    //generate OTP
    const { otp, expiry } = GenerateOTP();
    //create user
    const user = (await UserInstance.create({
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
    })) as unknown as UserAttributes;

    //mail otp to user
    mailUserOtp({
      to: email,
      OTP: otp,
    });

    //generate token
    // const token = jwt.sign({id:user.id, email:user.email},`quickbite` )
    const token = await GenerateSignature({ email: email, id: userId });
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(400).json({
      status: "error",
      method: req.method,
      message: error.message,
    });
  }
};

export const verifyOtp = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const otp = req.body.otp;
    const userId = req.user.payload.id;

    const user: any = (await UserInstance.findOne({
      where: { id: userId },
    })) as unknown as UserAttributes;

    if (user && user.otp === Number(otp) && user.otp_expiry > new Date()) {
      const newOtp = 108;
      await UserInstance.update(
        {
          verified: true,
          otp: newOtp,
        },
        { where: { id: userId } }
      );
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

export const reSendOtp = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.payload.id;
    const user: JwtPayload = (await UserInstance.findOne({
      where: { id: userId },
    })) as unknown as UserAttributes;

    //generate OTP
    const { otp, expiry } = GenerateOTP();

    const updatedUser = (await UserInstance.update(
      {
        otp,
        otp_expiry: expiry,
      },
      { where: { id: user.id } }
    )) as unknown as UserAttributes;

    if (updatedUser) {
      mailUserOtp({
        to: user.email,
        OTP: otp,
      });
      return res
        .status(200)
        .json({ status: "success", message: `OTP regenerated` });
    }
    return res.status(400).json({ message: `Otp generation unsuccesful` });
  } catch (error: any) {
    return res.status(400).json({
      status: "error",
      method: req.method,
      message: error.message,
    });
  }
};

export const userLogIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //catch frontend data
    const { email, password } = req.body;

    //fetch user
    const user = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAttributes;

    if (!user) {
      return res.status(404).json({
        status: "error",
        method: req.method,
        message: "user not found",
      });
    }

    if (user) {
      const validated = await bcrypt.compare(password, user.password);
      if (!validated) {
        return res.status(401).send({
          status: "error",
          method: req.method,
          message: "email or password is incorect",
        });
      }
      //check verified

      //generate token
      const token = await GenerateSignature({ id: user.id, email: user.email });
      res.cookie("token", token);
      return res.status(200).json({
        status: "success",
        method: req.method,
        message: "Login Successful",
        data: user,
        token,
      });
    }
  } catch (error: any) {
    console.log(error.message)
    return res.status(400).json({
      status: "error",
      method: req.method,
      message: error.message,
    });
  }
};

export const getAllVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let page = 1;
    if (req.query.page) {
      page = parseInt(req.query.page as string);
      if (Number.isNaN(page)) {
        return res.status(400).json({
          message: "Invalid page number",
        });
      }
    }

    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    const vendors = await VendorInstance.findAll();
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
  } catch (err) {
    console.error("Error executing getUsers:", err);
    return res.status(500).json({
      Error: "Internal Server Error",
    });
  }
};

export const getSingleVendors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.params.id;

    const vendor = await VendorInstance.findAll({ where: { id: vendorId } });

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
  } catch (err) {
    console.error("Error executing getUsers:", err);
    return res.status(500).json({
      Error: "Internal Server Error",
    });
  }
};

export const userGetFulfilledOrders = async (
  req: JwtPayload,
  res: Response
) => {
  try {
    const userId = req.user.id;

    const fulfilledOrders = await OrderInstance.findAll({
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error " });
  }
};

export const userGetsReadyOrders = async (req: JwtPayload, res: Response) => {
  try {
    const userId = req.user.id;
    const readyOrders = await OrderInstance.findAll({
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const userGetsPendingOrders = async (req: JwtPayload, res: Response) => {
  try {
    const userId = req.user.id;
    const pendingOrders = await OrderInstance.findAll({
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const userChangeOrderStatus = async (req: JwtPayload, res: Response) => {
  try {
    const { orderId, status } = req.body;

    const order = (await OrderInstance.findOne({
      where: { id: orderId },
    })) as unknown as OrderAttributes;

    if (!order) {
      return res.status(400).json({
        status: "error",
        method: req.method,
        message: "order not found",
      });
    }

    if (order.status === "Ready") {
      const updatedOrder = (await OrderInstance.update(
        { status: "Fulfilled" },
        { where: { id: orderId } }
      )) as unknown as OrderAttributes;

      return res.status(200).json({
        status: "success",
        method: req.method,
        message: "order status updated successfully",
        updatedOrder,
      });
    } else {
      return res.status(400).json({
        status: "error",
        method: req.method,
        message: "order status cannot be changed to Fulfilled",
      });
    }
  } catch (err) {
    console.error("Error updating order:", err);
    return res.status(500).json({
      Error: "Internal Server Error",
    });
  }
};

export const userMakeOrder = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items, cartTotal, address } = req.body;
    for(let i = 0; i<items.length; i++){
        items[i].status = 'pending'
    }
    const userid = req.user.payload.id;
    const foodid = items[0].id;
    const food = (await FoodInstance.findOne({
      where: { id: foodid },
    })) as unknown as FoodAttributes;
    const vendor: any = await VendorInstance.findOne({
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
    let deductions = companyEarn + tax
    let vendorEarn = cartTotal2 - deductions;
    vendor.earnings += vendorEarn;
    await vendor.save();
    for (let i = 0; i<items.length; i++) {
      const foodInstance: any = await FoodInstance.findOne({
        where: { id: items[i].id },
      });
      if (foodInstance) {
        foodInstance.order_count += 1;
        await foodInstance.save();
      }
    }
    const user = (await UserInstance.findOne({
      where: { id: userid },
    })) as unknown as UserAttributes;
    const userEmail = user.email;
    const vendorEmail = vendor.email;

    const orderId = v4();

    const order = (await OrderInstance.create({
      id: orderId,
      food_items: items,
      amount: Number(cartTotal),
      vendorId: vendor.id,
      address: address,
      status: "pending",
      userId: userid,
      isPaid: true,
    })) as unknown as OrderAttributes;
    if (order) {
        const vendor = await VendorInstance.findOne({where:{id:order.vendorId}})
      mailOrder(userEmail);
      mailVendorOrder(vendorEmail);
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
  } catch (err:any) {
    console.error("Error making order:", err.message);
    return res.status(500).json({
      Error: "Internal Server Error",
    });
  }
};

export const userEditProfile = async (req: JwtPayload, res: Response) => {
    try {
        const userId = req.user.payload.id
        const { email, firstname, lastname, address, phone_no } = req.body;

    const user2 = (await UserInstance.findOne({
      where: { id: userId },
    })) as unknown as UserAttributes;

    if (!user2) {
      return res.status(400).json({
        status: "error",
        method: req.method,
        message: "user not found",
      });
    }

    // Create an Object to store the fields that need to be updated
    const updatedUserFields: Partial<UserAttributes> = {};

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

    const updatedUser: any = (await UserInstance.update(updatedUserFields, {
      where: { id: userId },
    })) as unknown as UserAttributes;
    const user = (await UserInstance.findOne({
      where: { id: userId },
    })) as unknown as UserAttributes;
    console.log(user2);

    return res.status(200).json({
      status: "success",
      method: req.method,
      message: "user updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      Error: "Internal Server Error",
    });
  }
};

export const userGetsNewFoods = async (req: JwtPayload, res: Response) => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const recentFoods = await FoodInstance.findAll({
      where: {
        date_created: {
          [Op.gte]: oneMonthAgo,
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const userChangePassword = async (req: JwtPayload, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: `Password Mismatch`,
      });
    }
    const userid = req.user.payload.id;
    const user: any = (await UserInstance.findOne({
      where: { id: userid },
    })) as unknown as UserAttributes;

    const confirm = await bcrypt.compare(oldPassword, user.password);
    if (!confirm)
      return res.status(400).json({
        message: `Wrong Password`,
      });
    const token = await GenerateSignature({
      id: user.id,
      email: user.email,
    });
    //   res.cookie('token', token)
    const new_salt = await GenerateSalt();
    const hash = await hashPassword(newPassword, new_salt);
    const updatedPassword = (await UserInstance.update(
      {
        password: hash,
        salt: new_salt,
      },
      { where: { id: userid } }
    )) as unknown as UserAttributes;

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
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

export const userGetsAllOrders = async (req: JwtPayload, res: Response) => {
  try {
    const userId = req.user.payload.id;
    const userOrders = await OrderInstance.findAll({ where: { userId: userId } });
    if (!userOrders) {
      return res.status(404).json({ message: `Orders not found` });
    }
    const arr = []
    arr.push(userOrders)
    if (arr.length === 0) {
      return res.status(404).json({ message: `You do not have any orders` });
    }
    const orders = userOrders.map((a:any)=>a.food_items)
    const food1 = orders.map((a:any)=>{
      return Object.values(a)
    })
    let foodArr:any = [];
    for(let i = 0; i<food1.length; i++){
      foodArr = Object.values(food1[i])
    }
    return res.status(200).json({
      message: `All orders fetched`,
      data: foodArr,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const getSingleVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
      const vendorId = req.params.id

    const vendor = await VendorInstance.findAll({where: {id: vendorId}});

    if(!vendor){
      return res.status(400).send({
          status: "error",
          method: req.method,
          message:"vendor not found"
      }) 
    }

  return res.status(200).json({
    status: "success",
    method: req.method,
    message: "retrievd vendor successfully",
    data:vendor[0],
  });
} catch (err) {
  console.error("Error executing getUsers:", err);
  return res.status(500).json({
    Error: "Internal Server Error",
  });
}
};
