const { registerUser, loginUser, verifyOTP, resendOTP } = require("../services/auth.services");


const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

const login = async (req, res, next) => {
  try {
    const user = await loginUser(req.body);
    res.status(200).json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

const otpVerification = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    await verifyOTP(email, otp);
    res.status(200).json({ status: 'success', message: 'OTP verified successfully' });
  } catch (error) {
    next(error);
  }
};


const resendOTPController = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new Error('Email is required');

    const response = await resendOTP(email);
    res.status(200).json({ status: 'success', message: response.message });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, otpVerification,resendOTPController };
