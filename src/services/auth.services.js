const bcrypt = require("bcryptjs");
const { NotFoundError } = require("../utils/AppErrror");
const { User } = require("../models/user.model");

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ValidationError("User with this email already exists");
  }

  const user = new User(userData);
  await user.save();
  return user;
};

const loginUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email }).select(
    "+password"
  );

  if (!existingUser) {
    throw new NotFoundError("User not found");
  }

  const isMatch = await existingUser.comparePassword(userData.password);

  if (!isMatch) {
    throw new ValidationError("Invalid credentials");
  }

  return user;
};

// otp-service

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
};

const storeOTP = async (email) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  const otpRecord = new OTP({
    email,
    otp,
    expiresAt,
  });

  await otpRecord.save(); // Store OTP in the database
};

const verifyOTP = async (email, enteredOTP) => {
  const otpRecord = await OTP.findOne({ email });

  if (!otpRecord || otpRecord.otp !== enteredOTP) {
    throw new ValidationError("Invalid OTP");
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new ValidationError("OTP expired");
  }

  await OTP.deleteOne({ email }); // Delete OTP after use
};

const resendOTP = async (email) => {
  const existingOTP = await OTP.findOne({ email });

  // Optional: Prevent spam by checking time since last OTP
  if (existingOTP) {
    const timeSinceLast = Date.now() - existingOTP.createdAt.getTime();
    if (timeSinceLast < 60 * 1000)
      throw new Error("Please wait before requesting again");
    await OTP.deleteOne({ email }); // Remove old OTP if exists
  }

  const otp = generateOTP(); // e.g., '824190'
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.create({ email, otp, expiresAt });

  await sendOTPEmail(email, otp); // Send via nodemailer/twilio etc.

  return { message: "OTP resent successfully" };
};

module.exports = { registerUser, loginUser, storeOTP, verifyOTP, resendOTP };
