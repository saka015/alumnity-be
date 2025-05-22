const mongoose = require("mongoose");

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

// const acceptConnection = async(receiverId, senderId) => {
//     const connection = await Connection.findOneAndUpdate({ receiver: receiverId, sender: senderId, status: "pending" }, { status: "accepted" }, { new: true });
//     if (!connection) throw new Error("Request not found");
//     return connection;
// };

// const acceptConnection = async(receiverId, senderId) => {
//     const connection = await Connection.findOneAndUpdate({ receiver: receiverId, sender: new mongoose.Types.ObjectId(senderId), status: "pending" }, { status: "accepted" }, { new: true });
//     if (!connection) throw new Error(`Connection request from ${senderId} to ${receiverId} not found or already accepted`);
//     return connection;
// };


const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const acceptConnection = async(receiverId, senderId) => {
    if (!isValidObjectId(receiverId) || !isValidObjectId(senderId)) {
        throw new Error("Invalid receiverId or senderId");
    }

    const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    const connection = await Connection.findOneAndUpdate({ receiver: receiverObjectId, sender: senderObjectId, status: "pending" }, { status: "accepted" }, { new: true });

    if (!connection) {
        throw new Error(
            `Connection request from ${senderId} to ${receiverId} not found or already accepted`
        );
    }

    return connection;
};



const getUserConnections = async(status, userId) => {
    return Connection.find({
        $or: [{ sender: userId }, { receiver: userId }],
        status: status,
    }).populate("sender receiver");
};

const getConnectionStatus = async(currentUserId, profileUserId) => {
    const existingConnection = await Connection.findOne({
        $or: [
            { sender: currentUserId, receiver: profileUserId },
            { sender: profileUserId, receiver: currentUserId },
        ],
    });

    let connectionStatus = "none";

    if (existingConnection) {
        if (existingConnection.status === "pending") {
            if (existingConnection.sender.toString() === currentUserId.toString()) {
                connectionStatus = "requested";
            } else {
                connectionStatus = "incoming";
            }
        } else if (existingConnection.status === "accepted") {
            connectionStatus = "connected";
        }
    }

    return connectionStatus;
};

module.exports = {
    sendConnectionRequest,
    acceptConnection,
    getUserConnections,
    getConnectionStatus,
};