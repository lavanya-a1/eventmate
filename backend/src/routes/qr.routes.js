const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const auth = require('../middleware/auth');

router.get('/generate/:bookingId', auth, qrController.generateQRCode);

module.exports = router;
