const express = require('express')
const toursCollection = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./../routes/reviews')

const routes = express.Router()

routes.use('/:tourId/reviews', reviewRouter)

routes.route('/top-5-tours')
    .get(toursCollection.aliasTours, toursCollection.getTours)

routes.route('/tours-stats')
    .get(toursCollection.getTourStatus)

routes.route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo(['admin', 'lead-guide', 'guide']),
        toursCollection.getMonthlyPlan
    )

routes.route('/')
    .get(toursCollection.getTours)
    .post(
        authController.protect,
        authController.restrictTo(['admin', 'lead-guide']),
        toursCollection.createTour
    )

routes.route('/:id')
    .get(toursCollection.getTour)
    .patch(
        authController.protect,
        authController.restrictTo(['admin', 'lead-guide']),
        toursCollection.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo(['admin', 'lead-guide']),
        toursCollection.deleteTour
    )

module.exports = routes
