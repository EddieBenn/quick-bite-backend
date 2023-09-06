"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailVendorOrder = exports.orderVendorTransporter = exports.mailOrder = exports.orderTransporter = exports.mailUserOtp = exports.otpTransporter = exports.emailHtml = exports.sendmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.GMAIL_PASSWORD}`
    },
    tls: {
        rejectUnauthorized: false
    }
});
const sendmail = async (from, to, subject, html) => {
    try {
        const reponse = await exports.transporter.sendMail({
            from: `${process.env.GMAIL_USER}`,
            to,
            subject: "Welcome to QuickBite",
            html
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.sendmail = sendmail;
const emailHtml = (email, password) => {
    const mail = `<h3><em>Hello Vendor</em>,Your profile has been created.<h3>
                    <p>Your Email: ${email}</p><br>
                    <p>Your Password: ${password}</p><br><br>
                    <p>
                    Thank You<br>
                    TEAM QUICKBITE</p>`;
    return mail;
};
exports.emailHtml = emailHtml;
exports.otpTransporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.GMAIL_PASSWORD}`
    },
    tls: {
        rejectUnauthorized: false
    }
});
const mailUserOtp = async (params) => {
    try {
        const info = await exports.otpTransporter.sendMail({
            from: process.env.GMAIL_USER,
            to: params.to,
            subject: "VERIFY EMAIL",
            html: `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
            
                    .container {
                        max-width: 90%;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        border-radius: 10px;
                        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                    }
            
                    h2 {
                        color: #1A512E;;
                        text-align: center;
                        font-weight: 800;
                    }
            
                    p {
                        margin-bottom: 30px;
                        color: #777777;
                        text-align: center;
                    }
            
                    .otp {
                        font-size: 40px;
                        letter-spacing: 2px;
                        text-align: center;
                        color: #ff9900;
                        display: block;
                        margin-top: 20px;
                    }

                    .team {
                        color: #1A512E;
                        font-weight: 800
                    }
            
                    .signature {
                        color: #444444;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to QUICKBITE</h2>
                    <p>Please enter the OTP to complete your sign up</p>
                    <span class="otp">${params.OTP}</span>
                    <p class="signature">Thank You<br><span class="team">TEAM QUICKBITE</span></p>
                </div>
            </body>
            </html>`
        });
        return info;
    }
    catch (error) {
        console.log(error);
    }
};
exports.mailUserOtp = mailUserOtp;
exports.orderTransporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.GMAIL_PASSWORD}`
    },
    tls: {
        rejectUnauthorized: false
    }
});
const mailOrder = async (params) => {
    try {
        const info = await exports.orderTransporter.sendMail({
            from: process.env.GMAIL_USER,
            to: params,
            subject: "ORDER CREATED",
            html: `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
            
                    .container {
                        max-width: 90%;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        border-radius: 10px;
                        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                    }
            
                    h2 {
                        color: #1A512E;;
                        text-align: center;
                        font-weight: 800;
                    }
            
                    p {
                        margin-bottom: 30px;
                        text-align: center;
                        font-weight: 400;
                    }
            
                    .otp {
                        font-size: 40px;
                        letter-spacing: 2px;
                        text-align: center;
                        color: #ff9900;
                        display: block;
                        margin-top: 20px;
                    }

                    .team {
                        color: #1A512E;
                        font-weight: 800
                    }
            
                    .signature {
                        color: #444444;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to QUICKBITE</h2>
                    <p>Your order has been successfully created, Please check your dashboard to view your orders</p>
                    <p class="signature">Thank You<br><span class="team">TEAM QUICKBITE</span></p>
                </div>
            </body>
            </html>`
        });
        return info;
    }
    catch (error) {
        console.log(error.message);
    }
};
exports.mailOrder = mailOrder;
exports.orderVendorTransporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: `${process.env.GMAIL_USER}`,
        pass: `${process.env.GMAIL_PASSWORD}`
    },
    tls: {
        rejectUnauthorized: false
    }
});
const mailVendorOrder = async (params) => {
    try {
        const info = await exports.orderVendorTransporter.sendMail({
            from: process.env.GMAIL_USER,
            to: params,
            subject: "ORDER RECEIVED",
            html: `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                    }
            
                    .container {
                        max-width: 90%;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        border-radius: 10px;
                        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                    }
            
                    h2 {
                        color: #1A512E;;
                        text-align: center;
                        font-weight: 800;
                    }
            
                    p {
                        margin-bottom: 30px;
                        text-align: center;
                        font-weight: 400;
                    }
            
                    .otp {
                        font-size: 40px;
                        letter-spacing: 2px;
                        text-align: center;
                        color: #ff9900;
                        display: block;
                        margin-top: 20px;
                    }

                    .team {
                        color: #1A512E;
                        font-weight: 800
                    }
            
                    .signature {
                        color: #444444;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Welcome to QUICKBITE</h2>
                    <p>A user has ordered your product. Please check your dashboard to view order. 
                    Please remember to change order status to "ready" when the order is ready for delivery</p>
                    <p class="signature">Thank You<br><span class="team">TEAM QUICKBITE</span></p>
                </div>
            </body>
            </html>`
        });
        return info;
    }
    catch (error) {
        console.log(error.message);
    }
};
exports.mailVendorOrder = mailVendorOrder;
