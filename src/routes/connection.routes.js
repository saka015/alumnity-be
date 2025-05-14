const express = require('express');
const router = express.Router();
const controller = require('../controllers/connection.controller');
const { protect } = require('../middlewares/auth.middleware');



router.post('/send', protect, controller.sendRequest);
router.post('/accept', protect, controller.acceptRequest);
router.get('/my-connections', protect, controller.getConnections);

module.exports = router;