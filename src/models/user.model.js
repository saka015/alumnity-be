const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true,
        lowercase: true,
        minlength: [5, "Username must be at least 5 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            "Please enter a valid email",
        ],
    },

    loginMethod: {
        type: String,
        enum: ["email", "google"],
        default: "email",
    },

    password: {
        type: String,
        default: null,
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    profilePicture: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    graduationYear: {
        type: Number,
        default: 2025,
    },
    linkedin: {
        type: String,
    },
    company: {
        type: String,
    },
    position: {
        type: String,
    },
    calendly: {
        type: String,
    },
    college: {
        type: String,
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Connection",
    }, ],
}, {
    timestamps: true,
});

// 🔒 Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    if (!this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔑 Compare raw and hashed passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = { User };