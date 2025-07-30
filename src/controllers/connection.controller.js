const connectionService = require("../services/connection.service");
const { NotFoundError } = require("../utils/AppErrror");

const sendRequest = async (req, res, next) => {
  try {
    if (req.user._id === req.body.receiverId) {
      throw new NotFoundError("Can't send friend request to yourself.");
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

const acceptRequest = async (req, res, next) => {
  try {
    const { connectionId } = req.params;
    const userId = req.user._id;

    console.log("🔍 Backend received:", {
      connectionId,
      userId,
      params: req.params,
      body: req.body,
      url: req.url,
    });

    const connection = await connectionService.acceptConnectionById(
      connectionId,
      userId
    );

    res.status(200).json({
      message: "Connection accepted",
      connection,
    });
  } catch (err) {
    console.error("Accept connection error:", err);
    next(err);
  }
};

const getConnections = async (req, res, next) => {
  try {
    console.log("🔍 getConnections called with:", {
      status: req.query.status,
      userId: req.user._id,
    });

    const connections = await connectionService.getUserConnections(
      req.query.status,
      req.user._id
    );

    console.log("🔍 Found connections:", connections.length);
    connections.forEach((conn, index) => {
      console.log(`Connection ${index}:`, {
        id: conn._id,
        sender: conn.sender._id,
        receiver: conn.receiver._id,
        status: conn.status,
      });
    });

    res.status(200).json(connections);
  } catch (err) {
    next(err);
  }
};

const getPendingConnections = async (req, res, next) => {
  try {
    const pendingConnections = await connectionService.getPendingConnections(
      req.user._id
    );
    res.status(200).json(pendingConnections);
  } catch (err) {
    next(err);
  }
};

const getConnectionStatus = async (req, res, next) => {
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
  getPendingConnections,
  getConnectionStatus,
};
