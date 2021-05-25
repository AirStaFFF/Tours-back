const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const globalErrorHandler = require('./controllers/errorController')
const ApiError = require('./utils/apiErrors')
const toursRoutes = require('./routes/tours')
const usersRoutes = require('./routes/users')
const reviewsRoutes = require('./routes/reviews')
const app = express()

const rateOptions = {
    max: 100,
    windowMs: 15 * 60 * 1000
}

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use('/api', rateLimit(rateOptions))
app.use(express.json())

app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
    whitelist: [
        'rating',
        'ratingsAverage',
        'duration',
        'maxGroupSize',
        'difficulty',
        'ratingsQuantity',
        'price'
    ]
}))
app.use(cors())

app.use(express.static(`${__dirname}/public`))


app.use('/api/v1/users', usersRoutes)
app.use('/api/v1/tours', toursRoutes)
app.use('/api/v1/reviews', reviewsRoutes)

app.use(globalErrorHandler)

app.all('*', (req, res, next) => {
    next(new ApiError(`Can't find path ${ req.originalUrl } on server!`, 404))
})


module.exports = app
