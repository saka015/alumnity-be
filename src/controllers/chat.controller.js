const Message = require("../models/message.model");

exports.saveMessage = async({ sender, receiver, message }) => {
    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();
    return newMessage;
};

exports.getMessages = async(req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
                $or: [
                    { sender: currentUserId, receiver: userId },
                    { sender: userId, receiver: currentUserId },
                ],
            })
            .sort({ timestamp: 1 })
            .populate("sender receiver", "name username");

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: error.message });
    }
};