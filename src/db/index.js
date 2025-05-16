import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const ConnectDB = async ()=>{
    try{
        // console.log(`${process.env.MONGODB_URI}/${DB_NAME}`)
        const db_connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`DB MONGO CONNECTED SUCCESSFULLY!! HOST : ${db_connection.connection.host}`)
    }
    catch(err){
         console.log(`MONGODB CONNECTION FAILED | ${err}`)
         process.exit(1)
    }
}
export default ConnectDB;


