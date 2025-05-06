const nodemailer = require("nodemailer");
const { ValidationError } = require("./AppErrror");

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new ValidationError("Email configuration is missing");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOtpEmail = async (to, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verification Code</h2>
          <p style="color: #666; font-size: 16px;">Your OTP for registration/login is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    if (error.code === "EAUTH") {
      throw new ValidationError("Invalid email credentials");
    }
    throw new ValidationError(
      "Failed to send OTP email. Please try again later."
    );
  }
};

module.exports = { sendOtpEmail };
