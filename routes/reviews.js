const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')
const routes = express.Router({ mergeParams: true })


routes.use(authController.protect)

routes.route('/')
    .get(reviewController.getReviews)
    .post(
        authController.restrictTo(['user']),
        reviewController.findTourAndUserId,
        reviewController.createReview
    )

routes.route('/:id')
    .get(reviewController.getReview)
    .delete(
        authController.restrictTo(['user', 'admin']),
        reviewController.deleteReview
    )
    .patch(
        authController.restrictTo(['user', 'admin']),
        reviewController.updateReview
    )

module.exports = routes
