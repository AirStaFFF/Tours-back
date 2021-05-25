const express = require('express')
const usersController = require('../controllers/userController')
const authController = require('../controllers/authController')
const routes = express.Router()

routes.post('/signup', authController.signup)
routes.post('/login', authController.login)
routes.post('/forgot-password', authController.forgotPassword)
routes.patch('/reset-password/:token', authController.resetPassword)

// routes.use(authController.protect)

routes.patch('/update-password', authController.protect, authController.updatePassword)
routes.patch('/update-me', authController.protect, usersController.updateMe)
routes.patch('/delete-me', authController.protect, usersController.deleteMe)

routes.get('/me',
    authController.protect,
    usersController.getMe,
    usersController.getUser
)

// routes.use(authController.restrictTo(['admin']))

routes.route('/')
    .get(usersController.getAllUsers)
    .post(usersController.createUser)

routes.route('/:id')
    .get(usersController.getUser)
    .patch(usersController.updateUser)
    .delete(usersController.deleteUser)

module.exports = routes
