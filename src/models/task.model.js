const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdUsername: {
        type: String,
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },

    applicants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        email: String,
        title: String,
        description: String,
        appliedAt: { type: Date, default: Date.now }
    }],
    applied: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        enum: ["pending", "started", "late", "completed", "active", "inactive"],
        default: "pending",
    },

    price: {
        type: Number,
        min: [1, 'Price must be greater than 0'],
        required: true
    },

    dueDate: Date,
}, {
    timestamps: true,
});

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };