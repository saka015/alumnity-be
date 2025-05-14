const { User } = require("../models/user.model");
const { NotFoundError } = require("../utils/AppErrror");

const updateUserProfile = async(userId, updateData) => {
    const allowedUpdates = [
        "email",
        "graduationYear",
        "linkedin",
        "company",
        "position",
        "calendly",
        "isVerified",
    ];

    const updates = {};
    Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            updates[key] = updateData[key];
        }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
    }).select("-password");

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

const getExploreSeniors = async(userId, searchTerm) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError("User not found");
    }

    const query = {
        graduationYear: { $lt: user.graduationYear },
    };

    if (searchTerm && searchTerm.trim() !== "") {
        query.$or = [
            { name: { $regex: searchTerm, $options: "i" } },
            { company: { $regex: searchTerm, $options: "i" } },
            { position: { $regex: searchTerm, $options: "i" } },
        ];
    }

    const seniors = await User.find(query).select(
        "name graduationYear linkedin company position username"
    );

    return seniors;
};

const getAlumniByUsername = async(username) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
};

module.exports = { getExploreSeniors, getAlumniByUsername, updateUserProfile };