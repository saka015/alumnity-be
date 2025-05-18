const connectionService = require("../services/connection.services");

const sendRequest = async(req, res, next) => {
    try {

        if (req.user._id ===
            req.body.receiverId) {
            throw new NotFoundError("Can't send friend request me yourself.");
            return null;
        }

        const request = await connectionService.sendConnectionRequest(
            req.user._id,
            req.body.receiverId
        );
        res.status(201).json(request);
    } catch (err) {
        next(err);
    }
};

// const acceptRequest = async(req, res, next) => {
//     try {
//         const connection = await connectionService.acceptConnection(
//             req.user._id,
//             req.body.senderId
//         );
//         res.status(200).json(connection);
//     } catch (err) {
//         next(err);
//     }
// };

const acceptRequest = async(req, res, next) => {
    try {
        console.log("Incoming accept request:", {
            receiverId: req.user._id,
            senderId: req.body.senderId,
        });

        const connection = await connectionService.acceptConnection(
            req.user._id, // This should be the receiverId
            req.body.senderId // This should be the senderId
        );
        res.status(200).json(connection);
    } catch (err) {
        next(err);
    }
};

const getConnections = async(req, res, next) => {
    try {
        const connections = await connectionService.getUserConnections(
            req.query.status,
            req.user._id
        );
        res.status(200).json(connections);
    } catch (err) {
        next(err);
    }
};

const getConnectionStatus = async(req, res, next) => {
    try {
        const connectionStatus = await connectionService.getConnectionStatus(
            req.user._id,
            req.params.userId
        );
        res.status(200).json({ connectionStatus });
    } catch (err) {
        next(err);
    }
};



module.exports = {
    sendRequest,
    acceptRequest,
    getConnections,
    getConnectionStatus,
};