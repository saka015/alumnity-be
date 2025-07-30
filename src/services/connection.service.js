const mongoose = require("mongoose");

const Connection = require("../models/connection.model");
const { User } = require("../models/user.model");

const sendConnectionRequest = async (senderId, receiverId) => {
  const existing = await Connection.findOne({
    sender: senderId,
    receiver: receiverId,
  });
  if (existing) throw new Error("Request already sent");

  const connection = await Connection.create({
    sender: senderId,
    receiver: receiverId,
  });

  await User.findByIdAndUpdate(senderId, {
    $push: { connections: connection._id },
  });

  await User.findByIdAndUpdate(receiverId, {
    $push: { connections: connection._id },
  });

  return connection;
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const acceptConnectionById = async (connectionId, userId) => {
  console.log("🔧 Service received:", { connectionId, userId });

  if (!isValidObjectId(connectionId)) {
    console.log("❌ Invalid connectionId:", connectionId);
    throw new Error("Invalid connection ID");
  }

  console.log("🔍 Looking for connection with ID:", connectionId);
  const connection = await Connection.findById(connectionId);
  console.log("🔍 Found connection:", connection);

  if (!connection) {
    console.log("❌ Connection not found for ID:", connectionId);
    throw new Error("Connection not found");
  }

  console.log("🔍 Connection details:", {
    connectionId: connection._id,
    sender: connection.sender,
    receiver: connection.receiver,
    status: connection.status,
    userId: userId,
  });

  if (connection.receiver.toString() !== userId.toString()) {
    console.log("❌ Authorization failed:", {
      connectionReceiver: connection.receiver.toString(),
      userId: userId.toString(),
    });
    throw new Error("Not authorized to accept this connection");
  }

  if (connection.status !== "pending") {
    console.log("❌ Connection not pending:", connection.status);
    throw new Error("Connection is not pending");
  }

  console.log("✅ All checks passed, updating connection status");
  connection.status = "accepted";
  await connection.save();

  return connection.populate("sender receiver");
};

const acceptConnection = async (receiverId, senderId) => {
  if (!isValidObjectId(receiverId) || !isValidObjectId(senderId)) {
    throw new Error("Invalid receiverId or senderId");
  }

  const receiverObjectId = new mongoose.Types.ObjectId(receiverId);
  const senderObjectId = new mongoose.Types.ObjectId(senderId);

  console.log("Looking for connection:", {
    receiver: receiverObjectId,
    sender: senderObjectId,
    status: "pending",
  });

  const existingConnection = await Connection.findOne({
    receiver: receiverObjectId,
    sender: senderObjectId,
    status: "pending",
  });

  console.log("Existing connection found:", existingConnection);

  const connection = await Connection.findOneAndUpdate(
    {
      receiver: receiverObjectId,
      sender: senderObjectId,
      status: "pending",
    },
    { status: "accepted" },
    { new: true }
  ).populate("sender receiver");

  if (!connection) {
    throw new Error(
      `Connection request from ${senderId} to ${receiverId} not found or already accepted`
    );
  }

  return connection;
};

const getUserConnections = async (status, userId) => {
  console.log("🔧 getUserConnections called with:", { status, userId });

  const query = {
    $or: [{ sender: userId }, { receiver: userId }],
    status: status,
  };

  console.log("🔧 Executing query:", JSON.stringify(query, null, 2));

  const connections = await Connection.find(query).populate("sender receiver");

  console.log("🔧 Found connections:", connections.length);

  return connections;
};

const getPendingConnections = async (userId) => {
  return Connection.find({
    receiver: userId,
    status: "pending",
  }).populate("sender");
};

const getConnectionStatus = async (currentUserId, profileUserId) => {
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
  acceptConnectionById,
  getUserConnections,
  getPendingConnections,
  getConnectionStatus,
};
