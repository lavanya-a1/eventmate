const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, userController.getDashboardSummary);
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.put('/profile/password', auth, userController.changePassword);

module.exports = router;
