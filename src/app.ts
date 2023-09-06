import express from "express"
import dotenv from "dotenv"
import {db} from "./config"
import {HttpError} from 'http-errors';
import config from './config/dbConfig';
import vendorRoutes from './routes/vendorRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
import path from 'path';
import userRoutes from './routes/userRoutes'
import bodyParser from 'body-parser'



const {PORT} = config

dotenv.config()

const app = express()

app.use(bodyParser.json())

app.use(logger('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: false}));
app.use(cors())
app.use(express.static(path.join(__dirname, '../public')));

db.sync({}).then( ()=>{
    console.log("Database is connected");
}).catch((err:HttpError)=>{
    console.log(err);
})

app.use("/vendor", vendorRoutes)
app.use('/user', userRoutes)

// const {DB_PORT} = process.env
// console.log(DB_PORT);

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})

export default app;