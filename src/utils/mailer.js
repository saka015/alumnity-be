const nodemailer = require('nodemailer');

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',  // Use any email service you want (e.g., Gmail, SendGrid, etc.)
  auth: {
    user: process.env.EMAIL_USER,  // Your email address
    pass: process.env.EMAIL_PASS,  // Your email password or App password (for Gmail)
  },
});

// Send OTP email
const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,  // Sender's email
    to,                            // Recipient's email (user's email)
    subject: 'Your OTP Code',      // Email subject
    text: `Your OTP for registration/login is: ${otp}`,  // Email body (OTP code)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Error sending OTP email');
  }
};

module.exports = { sendOtpEmail };
