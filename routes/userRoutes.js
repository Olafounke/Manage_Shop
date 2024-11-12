const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');


router.get('/users', userController.getAllUsers);
router.get('/user/:id', userController.getUser);
router.post('/createUser', userController.createUser);
router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);

module.exports = router;
