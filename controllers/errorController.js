const ApiErrors = require('./../utils/apiErrors')
const { cloneDeep } = require('lodash')
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path} ${err.value}`
    return new ApiErrors(message, 400)
}

const handleValidationErrorDB = (err) => {
    const inputMessage = Object.values(err.errors).map(e => e.message).join('. ')
    const message = `Invalid input data. ${inputMessage}`
    return new ApiErrors(message, 400)
}

const handleDuplicatedDb = (err) => {
    const value = err.keyValue.name
    const message = `Duplicated value: ${value}. Please use another`
    return new ApiErrors(message, 400)
}

const handleJWTExpiredError = () => {
    return new ApiErrors('Token was expired! Please log in again.', 401)
}

const handleJWTError = () => {
    return new ApiErrors('Invalid token! Please log in again.', 401)
}

const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        error_name: err.name,
        stack: err.stack
    })
}

const sendProdError = (err, res) => {
    // Send error to client if this error is operational
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        // Logged this error
        console.error('ERROR', err)

        // Send it to the client
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!!!'
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'fail'

    if (process.env.NODE_ENV === 'development') {
        sendDevError(err, res)
    } else if (process.env.NODE_ENV === 'production') {
        let error = err
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (err.name === 'CastError') error = handleCastErrorDB(error)
        if (err.code === 11000) error = handleDuplicatedDb(error)
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error)
        if (err.name === 'JsonWebTokenError') error = handleJWTError(error)

        sendProdError(error, res)
    }

}
