const express = require('express');
const auth = require('../middleware/auth');
const realtimeController = require('../controllers/realtimeController');

const router = express.Router();

router.get('/stream', auth, realtimeController.streamUpdates);

module.exports = router;
