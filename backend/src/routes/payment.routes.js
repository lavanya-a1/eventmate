const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.post('/simulate', auth, paymentController.simulatePayment);

module.exports = router;
