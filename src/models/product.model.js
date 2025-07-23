const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    duration: { type: Number, default: 30 },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdUsername: String,

    meetLink: String,
    availableDates: [Date],

    bookedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookedAt: {
            type: Date,
            default: Date.now,
        },
        bookedDate: Date,
        bookedTime: {
            type: Number,
            enum: [18, 19, 20, 21, 22, 23],
            default: null,
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
    }, ],

    productType: {
        type: String,
        enum: ["session", "product"],
        required: true,
    },

    productLink: {
        type: String,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Product", productSchema);