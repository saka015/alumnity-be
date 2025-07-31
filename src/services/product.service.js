const { NotFoundError } = require("../utils/AppErrror");
const Product = require("../models/product.model");
const { OTP } = require("../models/otp.model");
const {
    sendOtpEmail,
    sendBookingConfirmationEmail,
} = require("../utils/mailer");

const postCreateProduct = async(userId, userName, productData) => {
    if (!userId || !productData) {
        throw new NotFoundError("User ID and product data are required.");
    }

    const newProduct = new Product({
        ...productData,
        createdBy: userId,
        createdUsername: userName,
    });

    await newProduct.save();
    return newProduct;
};

const getAllProduct = async(userId, searchTerm = "", page = 1, limit = 10) => {
    if (!userId) {
        throw new NotFoundError("User ID is required.");
    }

    const query = {};

    if (searchTerm) {
        query.title = { $regex: searchTerm, $options: "i" };
    }

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        products,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalProducts,
            itemsPerPage: limit,
        },
    };
};

const getProductById = async(id) => {
    const product = await Product.findById(id)
        .populate("createdBy", "username name email")
        .populate("bookedBy.user", "username name email");
    if (!product) {
        throw new NotFoundError("Product not found");
    }
    return product;
};

const sendPaymentOtp = async(email) => {
    try {
        const otp =
            process.env.NODE_ENV === "development" ?
            "111111" :
            Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OTP.deleteOne({ email });

        const otpRecord = new OTP({
            email,
            otp,
            expiresAt,
        });

        await otpRecord.save();
        await sendOtpEmail(email, otp);
        return { message: "Payment OTP sent successfully" };
    } catch (error) {
        throw new NotFoundError(error.message || "Failed to send payment OTP");
    }
};

// const verifyPaymentOtp = async (email, enteredOTP) => {
//   if (!email || !enteredOTP) {
//     throw new NotFoundError("Email and OTP are required");
//   }

//   const otpRecord = await OTP.findOne({ email });

//   if (!otpRecord) {
//     throw new NotFoundError("OTP not found or expired");
//   }

//   if (otpRecord.otp !== enteredOTP) {
//     throw new NotFoundError("Invalid OTP");
//   }

//   if (new Date() > otpRecord.expiresAt) {
//     await OTP.deleteOne({ email });
//     throw new NotFoundError("OTP expired");
//   }

//   await OTP.deleteOne({ email });
//   return { message: "Payment OTP verified successfully" };
// };

const verifyPaymentOtp = async(
    email,
    enteredOTP,
    productId,
    bookedDate,
    bookedTime,
    userId
) => {
    if (!email || !enteredOTP) {
        throw new NotFoundError("Email and OTP are required");
    }

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
        throw new NotFoundError("OTP not found or expired");
    }

    if (otpRecord.otp !== enteredOTP) {
        throw new NotFoundError("Invalid OTP");
    }

    if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ email });
        throw new NotFoundError("OTP expired");
    }

    await OTP.deleteOne({ email });

    const product = await Product.findById(productId).populate(
        "createdBy",
        "name email"
    );
    if (!product) {
        throw new NotFoundError("Product not found");
    }

    if (!product.bookedBy) {
        product.bookedBy = [];
    }

    if (product.productType === "session") {
        const existingBooking = product.bookedBy.find(
            (booking) =>
            booking.bookedDate.toISOString() ===
            new Date(bookedDate).toISOString() &&
            booking.bookedTime === bookedTime
        );

        if (existingBooking) {
            throw new NotFoundError("This time slot is already booked");
        }

        product.bookedBy.push({
            user: userId,
            bookedDate,
            bookedTime,
            paymentStatus: "paid",
        });
    } else {
        product.bookedBy.push({
            user: userId,
            paymentStatus: "paid",
        });
    }

    await product.save();

    const emailData = {
        productName: product.title,
        creatorName: product.createdBy.name,
        meetLink: product.meetLink || "Will be shared soon",
    };

    if (product.productType === "session") {
        emailData.bookedDate = bookedDate;
        emailData.bookedTime = bookedTime;
    }

    await sendBookingConfirmationEmail(email, emailData);

    return {
        message: "Payment OTP verified successfully and booking confirmed",
    };
};

module.exports = {
    postCreateProduct,
    getAllProduct,
    getProductById,
    sendPaymentOtp,
    verifyPaymentOtp,
};