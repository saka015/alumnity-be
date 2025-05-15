const { saveMessage } = require("../controllers/chat.controller");
const userSocketMap = require("../utils/userSocketMap");

const socketHandler = (io) => {
        console.log("Socket handler initialized");

        io.on("connection", (socket) => {
                    console.log("Socket connection established:", socket.id);

                    // Debug: Log all connected sockets
                    const sockets = Array.from(io.sockets.sockets).map(s => s[0]);
                    console.log(`Total connected sockets: ${sockets.length}`);

                    socket.on("register_user", (userId) => {
                        if (!userId) {
                            console.log("User ID missing during registration");
                            return;
                        }

                        // Store the socket mapping
                        userSocketMap.set(userId, socket.id);
                        console.log(`User ${userId} registered successfully with socket ${socket.id}`);
                        console.log("Current connected users:", Array.from(userSocketMap.entries()));

                        // Acknowledge registration
                        socket.emit("registration_success", { userId, socketId: socket.id });
                    });

                    socket.on("send_message", async({ senderId, receiverId, message }) => {
                        console.log("Processing message event:", { senderId, receiverId, message });

                        try {
                            if (!senderId || !receiverId || !message) {
                                console.log("Invalid message data:", { senderId, receiverId, message });
                                socket.emit("message_error", { error: "Missing required message data" });
                                return;
                            }

                            // Save message to database
                            const savedMessage = await saveMessage({
                                sender: senderId,
                                receiver: receiverId,
                                message,
                            });

                            console.log("Message saved successfully:", savedMessage);

                            // Send to receiver if online
                            const receiverSocketId = userSocketMap.get(receiverId);
                            if (receiverSocketId) {
                                console.log(`Sending message to receiver ${receiverId} at socket ${receiverSocketId}`);
                                io.to(receiverSocketId).emit("receive_message", savedMessage);
                            } else {
                                console.log(`Receiver ${receiverId} is not online`);
                            }

                            // Also send back to sender to confirm delivery
                            socket.emit("receive_message", savedMessage);

                            const senderSocketId = userSocketMap.get(senderId);
                            if (senderSocketId && senderSocketId !== socket.id) {
                                console.log(`Sending message to sender's other devices at socket ${senderSocketId}`);
                                io.to(senderSocketId).emit("receive_message", savedMessage);
                            }
                        } catch (error) {
                            console.error("Error processing message:", error);
                            socket.emit("message_error", { error: error.message });
                        }
                    });

                    socket.on("error", (error) => {
                        console.error("Socket error:", error);
                    });

                    socket.on("disconnect", () => {
                                let disconnectedUserId = null;
                                for (let [userId, socketId] of userSocketMap.entries()) {
                                    if (socketId === socket.id) {
                                        console.log(`User ${userId} disconnected`);
                                        userSocketMap.delete(userId);
                                        disconnectedUserId = userId;
                                        break;
                                    }
                                }
                                console.log(`Socket ${socket.id} disconnected${disconnectedUserId ? ` (User: ${disconnectedUserId})` : ''}`);
            console.log("Remaining connected users:", Array.from(userSocketMap.entries()));
        });
    });
};

module.exports = socketHandler;