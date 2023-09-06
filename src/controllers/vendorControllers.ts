import { Request, Response, NextFunction } from "express";
import { v4 } from "uuid";
import {
  GenerateSalt,
  passWordGenerator,
  hashPassword,
  GenerateSignature,
} from "../utils/helpers";
import { axiosVerifyVendor } from "../utils/helpers";
import { JwtPayload } from "jsonwebtoken";
import { VendorAttributes, VendorInstance } from "../models/vendorModel";
import { emailHtml, sendmail } from "../utils/emailFunctions";
import { GMAIL_USER } from "../config";
import { zodSchema, validateFoodSchema } from "../utils/validators";
import { FoodAttributes, FoodInstance } from "../models/foodModel";
import { vendorLoginSchema } from "../utils/validators";
import bcrypt from "bcrypt";
import { OrderAttributes, OrderInstance } from "../models/orderModel";

export const verifyVendor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const regNo: any = req.body.regNo;
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
    
    const verifiedRegNo = await axiosVerifyVendor(regNo);
    if (verifiedRegNo === "not found") {
      return res.status(404).json({
        message: `The business is not found`,
      });
    }

    const token = await GenerateSignature({
      regNo: verifiedRegNo.findCompany.reg_no,
      company_name: `${verifiedRegNo.findCompany.company_name}`,
    });

    return res.status(200).json({
      message: `${verifiedRegNo.findCompany.company_name} is verified`,
      company_name: `${verifiedRegNo.findCompany.company_name}`,
      registration_Number: `${verifiedRegNo.findCompany.reg_no}`,
      token,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

export const registerVendor = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    let newUser = req.body;

    const error = zodSchema.safeParse(newUser);
    if (error.success === false) {
      res.status(400).send({
        error: error.error.issues[0].message,
      });
      return;
    }

    const id = v4();
    const userId = req.regNo;
    const compName = req.company_name;
    // const registeredBusiness = await axiosVerifyVendor(userId);

    const {
      email,
      phone_no,
      name_of_owner,
      restaurant_name,
      address,
      cover_image,
    } = req.body;

    const verifyIfVendorExistByEmail = (await VendorInstance.findOne({
      where: { email: email },
    })) as unknown as VendorAttributes;
    const verifyIfVendorExistByRestaurantName = (await VendorInstance.findOne({
      where: { restaurant_name: restaurant_name },
    })) as unknown as VendorAttributes;

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

    const salt = await GenerateSalt();
    const password = await passWordGenerator(phone_no);
    console.log("password is", password);
    const hash = await hashPassword(password, salt);
    const html = emailHtml(email, password);

    const newVendor = (await VendorInstance.create({
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
    })) as unknown as VendorAttributes;

    if (!newVendor) {
      return res.status(400).json({
        message: `Vendor's profile couldn't be created`,
      });
    }
    if (newVendor) {
      const vend = (await VendorInstance.findOne({
        where: { id: id },
      })) as unknown as VendorAttributes;
      await sendmail(GMAIL_USER!, email, "Welcome", html);
      const token = await GenerateSignature({ email: vend.email, id: vend.id });
      res.cookie("token", token);
      return res.status(200).json({
        message: `Vendor created successfully`,
        vend,
        token,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

// Vendor Creates Food
export const vendorcreatesFood = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.vendor.id;

    const { name, price, food_image, ready_time, description } = req.body;

    // const venid = vendorId

    const error = validateFoodSchema.safeParse(req.body);
    if (error.success === false) {
      res.status(400).send({
        error: error.error.issues[0].message,
      });
      return;
    }
    const existingFood = (await FoodInstance.findOne({
      where: { name: name },
    })) as unknown as FoodAttributes;

    if (existingFood) {
      return res.send({
        message: `Food exists`,
      });
    }
    let foodid = v4();
    // Create a new food object
    const newFood = (await FoodInstance.create({
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
    })) as unknown as FoodAttributes;

    // console.log(newFood.vendorId);
    if (newFood)
      return res
        .status(200)
        .json({ message: `Food created successfully`, newFood });
    return res.status(400).json({ message: `Unable to create` });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal Server Error.`,
    });
  }
};

// Vendor Get All Food
export const vendorgetsAllHisFood = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.vendor.id;
    const allFood = await FoodInstance.findAll({
      where: {
        vendorId: vendorId,
      },
    });
    const count = allFood.length;
    return res.status(200).json({
      allFood,
      count,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

// Vendor Get Single Food
export const vendorGetsSingleFood = async (req: JwtPayload, res: Response) => {
  try {
    const vendorId = req.vendor.id;
    const foodid = req.query.foodid;
    const food = (await FoodInstance.findOne({
      where: { id: foodid, vendorId: vendorId },
    })) as unknown as FoodAttributes;
    if (!food) return res.status(400).json({ message: `Unable to fetch food` });
    return res.status(200).json({
      message: `Here is your food`,
      food,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

export const vendorLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validateVendor = vendorLoginSchema.safeParse({ email, password });
    if (validateVendor.success === false) {
      return res.status(400).send({
        status: "error",
        method: req.method,
        message: validateVendor.error.issues,
      });
    }
    const vendor = (await VendorInstance.findOne({
      where: { email: email },
    })) as unknown as VendorAttributes;
    if (!vendor) return res.status(404).json({ message: `Vendor not found` });

    const validatePassword = await bcrypt.compare(password, vendor.password);

    const token = await GenerateSignature({
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

export const vendorChangePassword = async (req: JwtPayload, res: Response) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log(req.body);
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: `Password Mismatch`,
      });
    }
    const vendorid = req.vendor.id;
    const vendor: any = (await VendorInstance.findOne({
      where: { id: vendorid },
    })) as unknown as VendorAttributes;

    const confirm = await bcrypt.compare(oldPassword, vendor.password);
    if (!confirm)
      return res.status(400).json({
        message: `Wrong Password`,
      });
    const token = await GenerateSignature({
      id: vendor.id,
      email: vendor.email,
    });
    res.cookie("token", token);
    const new_salt = await GenerateSalt();
    const hash = await hashPassword(newPassword, new_salt);
    const updatedPassword = (await VendorInstance.update(
      {
        password: hash,
        salt: new_salt,
      },
      { where: { id: vendorid } }
    )) as unknown as VendorAttributes;

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
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

export const vendorEditProfile = async (req: JwtPayload, res: Response) => {
  try {
    const vend = req.vendor.id;
    const { email, restaurant_name, name_of_owner, address, phone_no } =
      req.body;
    //   const validateResult = updateSchema.validate(req.body, option);
    //   if (validateResult.error) {
    //     return res.status(400).json({
    //       Error: validateResult.error.details[0].message,
    //     });
    //   }

    const findVendor = (await VendorInstance.findOne({
      where: { id: vend },
    })) as unknown as VendorAttributes;

    if (!findVendor)
      return res.status(404).json({ msg: `You cannot edit this profile` });

    // Create an object to store the fields that need to be updated
    const updatedFields: Partial<VendorAttributes> = {};

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
    const rowsAffected: any = (await VendorInstance.update(updatedFields, {
      where: { id: vend },
    })) as unknown as VendorAttributes;
    if (rowsAffected) {
      const vendor: JwtPayload = (await VendorInstance.findOne({
        where: { id: vend },
      })) as unknown as VendorAttributes;
      const token = await GenerateSignature({
        id: vendor.id,
        email: vendor.email,
      });
      res.cookie("token", token);
      const newVendor = (await VendorInstance.findOne({
        where: { id: vend },
      })) as unknown as VendorAttributes;
      return res.status(200).json({
        message: "You have successfully updated your profile",
        newVendor,
      });
    }

    return res.status(400).json({
      message: "Error updating your profile",
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};

export const vendorGetsProfile = async (req: JwtPayload, res: Response) => {
  try {
    const userId = req.vendor.id;
    const vendor = await VendorInstance.findOne({ where: { id: userId } });
    if (!vendor) return res.status(404).json({ message: `Vendor not found` });
    let arr = [vendor];

    return res.status(200).json({ message: `Here is your profile`, vendor, arr });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};

export const updateFood = async (req: JwtPayload, res: Response) => {
  // console.log( JwtPayload)
  try {
    const id = req.vendor.id;
    const vendor = await VendorInstance.findOne({where:{id:id}}) as unknown as VendorAttributes
    const foodid = req.params.id
    let { name, price, ready_time, description } = req.body;
    const updatedFields: Partial<FoodAttributes> = {};
    let a;
    if (name !== "") {
      updatedFields.name = name;
    }
    if (price !== "") {
      updatedFields.price = Number(price);
      a = updatedFields.price
    }
    if (ready_time !== "") {
      updatedFields.ready_time = ready_time;
    }
    if (description !== "") {
      updatedFields.description = description;
    }
    const rowsAffected: any = (await FoodInstance.update(updatedFields, {
      where: { id: foodid },
    })) as unknown as FoodAttributes;
    const token = await GenerateSignature({
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
  } catch (error:any) {
    console.log(error.message);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const DeleteSingleFood = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.vendor.id;
    const foodId = req.params.foodid
    console.log(foodId);
    const food = await FoodInstance.findOne({ where: { id: foodId} });
    if (!food)
      return res
        .status(404)
        .json({ message: `Food not found` });
    await FoodInstance.destroy({ where: { id: foodId } });
    return res.status(200).json({ message: `Food was deleted successfully` });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};

export const DeleteAllFood = async (req: JwtPayload, res: Response) => {
  try {
    const food = await FoodInstance.destroy({ truncate: true });

    return res.status(200).json({ message: `All vendors deleted successfully` });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};

export const changeStatus = async (req: JwtPayload, res: Response) => {
  try {
    const { orderId } = req.params;

    const order = await OrderInstance.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.markAsReady();

    return res.json({ message: "Order status updated to ready" });
  } catch (error:any){
    console.error(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const vendorGetsOrderCount = async (req: JwtPayload, res: Response) => {
  try {
    const vendorId = req.vendor.id;
    const vendorOrders: any = (await OrderInstance.findAll({
      where: { vendorId: vendorId },
    })) as unknown as OrderAttributes;
    const vendor: any = await VendorInstance.findOne({
      where: { id: vendorId },
    });
    const orders = vendorOrders.map((a:any)=>a.food_items)
    const food1 = orders.map((a:any)=>{
      return Object.values(a)
    })
    let foodArr:any = [];
    for(let i = 0; i<food1.length; i++){
      foodArr = Object.values(food1[i])
    }
    if (!vendorOrders) {
      return res.status(404).json({
        message: `Vendor order not found`,
      });
    } else if (vendorOrders) {
      const orderCount = vendorOrders.length;

      return res.status(200).json({
        message: `Vendor's order fetched`,
        orderCount,
        vendorOrders,
        orders,
        foodArr
      });
    }
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const vendorTotalRevenue = async (req: JwtPayload, res: Response) => {
  try {
    const vendorId = req.vendor.id;
    const vendorRevenue = await VendorInstance.findOne({
      where: { id: vendorId },
    });
    if (!vendorRevenue) {
      return res.status(404).json({
        message: `Vendor's total revenue cannot be fetched`,
      });
    } else if (vendorRevenue) {
      const totalRevenue = vendorRevenue.revenue;
      return res.status(200).json({
        message: `Vendor's total revenue fetched successfully`,
        totalRevenue,
      });
    }
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const vendorAvailability = async (req: JwtPayload, res: Response) => {
  try {
    const vendorId = req.vendor.id;
    const availableVendor = await VendorInstance.findOne({
      where: { id: vendorId },
    });
    if (!availableVendor) {
      return res.status(404).json({
        message: `Vendor not found`,
      });
    } else if (availableVendor) {
      try {
        const newAvailability = !availableVendor.isAvailable;
        // const updateVendor= await VendorInstance.update({isAvailable: true }, {where: {id: vendorId}})

        await VendorInstance.update(
          { isAvailable: newAvailability },
          { where: { id: vendorId } }
        );

        return res.status(200).json({
          message: `Vendor availability status updated`,
        });
      } catch (err: any) {
        console.log(err);
        return res.status(500).json({ message: `Internal server error` });
      }
    }
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

export const singleOrderDetails = async (req: JwtPayload, res: Response) => {
  try {
    const orderId = req.params.id;

    
    // const orderDetails = await OrderInstance.findAll({
      //   where: { id: orderId },
      // });
      
      const orderDetails = await OrderInstance.findOne({
        where: { id: orderId },
      }) as unknown as OrderAttributes
      console.log('orderid', orderDetails);

    if (!orderDetails) {
      return res.status(404).json({
        message: `Order not found`,
      });
    } else if (orderDetails) {
      return res.status(200).json({
        status: "success",
        message: `Order details fetched`,
        data: orderDetails,
      });
    }
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const vendorGetHisPopularFoods = async (
  req: JwtPayload,
  res: Response
) => {
  try {
    let totalFoods = [];
    const id = req.vendor.id;
    const vendorsFoods: any = (await FoodInstance.findAll({
      where: { vendorId: id },
    })) as unknown as FoodAttributes;
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
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: `Internal server error` });
  }
};

export const vendorTotalEarnings = async (req: JwtPayload, res: Response) => {
  try {
    const vendorId = req.vendor.id;
    const vendor = (await VendorInstance.findOne({
      where: { id: vendorId },
    })) as unknown as VendorAttributes;
    if (!vendor) {
      return res.status(404).json({
        message: `Vendor's total earnings cannot be fetched`,
      });
    } else if (vendor) {
      const totalEarning = vendor.earnings;
      return res.status(200).json({
        message: `Vendor's total earnings fetched successfully`,
        totalEarning,
      });
    }
  } catch (err: any) {
    console.log(err);
    return res.status(500).json({
      message: `Internal server error`,
    });
  }
};

export const orderByFood = async (req: JwtPayload, res: Response) => {
  try {
    const vId = req.vendor.id;
    let vendorFoodArr = [];
    const vendorFoods: any = (await FoodInstance.findAll({
      where: { vendorId: vId },
    })) as unknown as FoodAttributes;
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
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

export const earningsAndRevenue = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.vendor.id;
    const vendor = (await VendorInstance.findOne({
      where: { id: id },
    })) as unknown as VendorAttributes;
    if (!vendor)
      return res.status(404).json({ message: `Details not fetched` });
    console.log(vendor.orders)
    const earningRevenueArray = [];
    earningRevenueArray.push({
      earnings: vendor.earnings,
      revenue: vendor.revenue,
    });
    return res.status(200).json({
      message: `Details fetched`,
      earningRevenueArray,
    });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({
      message: `Internal Server Error`,
    });
  }
};

export const DeleteSingleOrder = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.vendor.id;
    const orderid = req.params.orderid
    const order = await OrderInstance.findOne({ where: { id: orderid} });
    console.log(orderid);
    if (!order)
      return res
        .status(404)
        .json({ message: `Order not found` });
    await OrderInstance.destroy({ where: { id: orderid } });
    return res.status(200).json({ message: `Order was deleted successfully` });
  } catch (err: any) {
    console.log(err.message);
    return res.status(500).json({ message: `Internal Server Error` });
  }
};