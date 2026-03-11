const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const feedbackSchemas = require('../validations/feedback.validation');

router.post('/', auth, validate(feedbackSchemas.createFeedback), feedbackController.createFeedback);
router.get('/my', auth, feedbackController.getMyFeedback);

module.exports = router;
