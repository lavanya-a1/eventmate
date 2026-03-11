const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const userSchemas = require('../validations/user.validation');

router.get('/dashboard', auth, userController.getDashboardSummary);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, validate(userSchemas.updateProfile), userController.updateProfile);
router.put('/profile/password', auth, validate(userSchemas.changePassword), userController.changePassword);

module.exports = router;
