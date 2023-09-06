import {Request, Response, NextFunction } from "express";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { APP_SECRET } from "../config";
import { VendorInstance, VendorAttributes } from "../models/vendorModel";



export const authForVerifiedVendor = async(req:JwtPayload, res:Response, next:NextFunction) => {
    try{
    const authorization = req.headers.authorization;
    if(authorization === undefined){
        return res.status(401).send({
            status: "error",
            data: "You are not authorised"
        })
    }
    const token = authorization.split(" ")[1];
    if(!token || token === ""){
        return res.status(401).send({
            status: "error",
            data: "access denied"
        })
    }
    
    const decoded:any = jwt.verify(token, `${process.env.APP_SECRET}`)
    if(!decoded) return res.status(401).send({
        status: "error",
        data: "You have not been verified"
    })

    req.regNo = decoded.payload.regNo;
    req.company_name = decoded.payload.company_name
   
    return next()
} catch(err){
    console.log(err)
}
}



export const auth = async(req:JwtPayload, res:Response, next:NextFunction) => {
    try{
    const authorization = req.headers.authorization;
    if(authorization===undefined){
          return res.status(401).send({
            status: "There is an Error",
            message: "Ensure that you are logged in"
          })
    }
    const pin = authorization.split(" ")[1];
    if(!pin || pin ===""){
        return res.status(401).send({
            status: "Error",
            message: "The pin can't be used"
        })
    }
    const decoded = jwt.verify(pin, `${APP_SECRET}`)
        req.user = decoded
    return next()
}catch(err){
    console.log("ERROR:",err)
    return res.status(401).send({
        status: "Error",
        message: err
      })
}
}

export const vendorauth = async(req:JwtPayload, res:Response, next:NextFunction) => {
    try{
    const authorization = req.headers.authorization;
    if(authorization===undefined){
        return res.status(401).send({
            status: "There is an Error",
            message: "Ensure that you are logged in"
        })
    }
    const pin = authorization.split(" ")[1];
    if(!pin || pin ===""){
        return res.status(401).send({
            status: "Error",
            message: "The pin can't be used"
        })
    }
    const decoded:any = jwt.verify(pin, `${APP_SECRET}`)
    const vendor = await VendorInstance.findOne({where: { id: decoded.payload.id },
    }) as unknown as VendorAttributes;
    if(vendor.role !== 'vendor')
    return res.status(400).json({message: `You are not a vendor`})
    req.vendor = decoded.payload
    // console.log( " valid vendor id",req.vendor)
    return next()
}catch(err:any){console.log(err.message)}
}