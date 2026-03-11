const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const paymentSchemas = require('../validations/payment.validation');

router.post('/simulate', auth, validate(paymentSchemas.simulatePayment), paymentController.simulatePayment);

module.exports = router;
