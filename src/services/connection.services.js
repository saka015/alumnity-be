const Connection = require("../models/connection.model");

const sendConnectionRequest = async(senderId, receiverId) => {
    const existing = await Connection.findOne({
        sender: senderId,
        receiver: receiverId,
    });
    if (existing) throw new Error("Request already sent");

    const connection = await Connection.create({
        sender: senderId,
        receiver: receiverId,
    });
    return connection;
};

const acceptConnection = async(receiverId, senderId) => {
    const connection = await Connection.findOneAndUpdate({ receiver: receiverId, sender: senderId, status: "pending" }, { status: "accepted" }, { new: true });
    if (!connection) throw new Error("Request not found");
    return connection;
};

const getUserConnections = async(status, userId) => {
    return Connection.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: status,
    }).populate("sender receiver");
};

module.exports = {
    sendConnectionRequest,
    acceptConnection,
    getUserConnections,
};