import bcrypt from 'bcrypt';
import {APP_SECRET} from '../config';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios from 'axios'

export const axiosVerifyVendor = async (reg_numnber:string)=>{
  try {
    const url = `https://business-name-verifier.onrender.com/company/getsingle?reg_number=${reg_numnber}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error:any) {
    // Handle the error here
    if (error.response && error.response.status === 404) {
      return "not found"; // Return an empty array to indicate no data found
    }
    throw error; // Re-throw other errors
  }
};

export const GenerateSalt = async() =>{
    const saltRounds = 10;
    return await bcrypt.genSalt(saltRounds)
}

export const hashPassword = async(password:string, salt:string) => {
    return await bcrypt.hash(password, salt)
}

export const GenerateSignatureForVerify = async(regNo:string) => {
    const payload = { regNo };
    return jwt.sign(payload, APP_SECRET!, {expiresIn:'1h'})
}

export const GenerateSignature = async(payload:any) => {
    return jwt.sign({payload}, `${APP_SECRET}`, {expiresIn:'10h'})
}

export const verifySignature= async(signature:string) => {
    return jwt.verify(signature, APP_SECRET!) as JwtPayload
}

export const checkPassword = async(enteredPassword:string, savedPassword:string)=>{
    return await bcrypt.compare(enteredPassword, savedPassword)
}

export const passWordGenerator = async(phone_no:string)=>{
    const passwordshuffle = phone_no.toString()
    let newShuffle = passwordshuffle.slice(-2)
    const mixup = newShuffle += Math.floor(100 + Math.random() * 9000)
    return mixup
}

export const GenerateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const expiry = new Date()
    expiry.setTime(new Date().getTime() + (30*60*1000))
    return {otp, expiry}
}