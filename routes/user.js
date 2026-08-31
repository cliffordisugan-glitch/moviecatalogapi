const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verify } = require('../auth'); // Import authentication middleware

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Add the missing details route
router.get('/details', verify, userController.getProfile);

module.exports = router;