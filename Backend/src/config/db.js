import mongoose from "mongoose";
import express from "express";
import config from "./config.js";


const dbconnect = async () => {
    try {
        await mongoose.connect(config.MONGO_URI)
        console.log("Database connected successfully")
    } catch(error){
        console.log("Database connection failed", error)
    }
}

export default dbconnect;