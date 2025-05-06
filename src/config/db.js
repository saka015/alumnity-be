const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // if (!process.env.MONGODB_URI) {
    //   throw new Error("MONGODB_URI is not defined in environment variables");
    // }

    const conn = await mongoose.connect(
      "mongodb+srv://saka015:SAKA%40always15@cluster0.pbf7o8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    // Create indexes for User and OTP models
    const { User } = require("../models/user.model");
    const { OTP } = require("../models/otp.model");

    await User.syncIndexes();
    await OTP.syncIndexes();

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
