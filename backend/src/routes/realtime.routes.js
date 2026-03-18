const express = require('express');
const auth = require('../middleware/auth');
const sseAuthToken = require('../middleware/sseAuthToken');
const realtimeController = require('../controllers/realtimeController');

const router = express.Router();

router.get('/stream', sseAuthToken, auth, realtimeController.streamUpdates);

module.exports = router;
