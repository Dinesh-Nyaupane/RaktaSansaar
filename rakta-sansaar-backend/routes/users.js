const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
// Get all users
// GET /api/users
router.get('/', userController.getAllUsers);

// User signup route
router.post('/signup', userController.signup);

router.get('/stats', userController.getStats);

const upload = require('../middlewares/upload'); // path to your multer config file

router.put('/update/:id', upload.single('image'), userController.updateUser);

// Get user by ID
router.get('/:id', userController.getUser);

// Update user by ID

// Delete user by ID
router.delete('/delete/:id', userController.deleteUser);

// Change user password by ID
router.put('/change-password/:id', userController.changePassword);


module.exports = router;
