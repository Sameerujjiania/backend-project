import express from "express"
import dotenv from "dotenv"
import ConnectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path: "./.env"
})

ConnectDB().then(()=>{
    app.listen(process.env.PORT || 8000)
    console.log(`Server is listening on port : ${process.env.PORT || 8000}`)
}).catch((err)=>{
    console.log("mongo connection failed", err)
})
