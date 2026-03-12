const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Authentication routes
router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);

// User management routes (admin)
router.get('/all', userController.getAllUsers);
router.get('/pending', userController.getPendingUsers);
router.get('/approved', userController.getApprovedUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/approve', userController.approveUser);
router.patch('/:id/reject', userController.rejectUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
