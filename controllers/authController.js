const User = require('./../models/userModel')
const jwt = require('jsonwebtoken')
const { promisify } = require('util')
// const ApiFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const ApiErrors = require('./../utils/apiErrors')
const sendEmail = require('./../utils/email')
const crypto = require('crypto')


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    })
}

const sendToken = (user, statusCode, res) => {
    const token = generateToken(user._id)

    let cookieOptions = {
        expires: new Date(Date.now() + process.env.COOKIE_JWT_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") cookieOptions = true

    res.cookie(
        'jwt',
        token,
        cookieOptions
    )

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })

    sendToken(newUser, 201, res)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new ApiErrors('Provide email and password', 400))
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new ApiErrors('Please provide correct email or password', 401))
    }

    await sendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
    // Find token
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
        return next(new ApiErrors('Your are not logged in! Please log in to get access'))
    }

    // Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // Check if user is still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new ApiErrors('User not found', 401))
    }

    // Check if user change his pass
    if (await currentUser.changedIsPassword(decoded.iat)) {
        return next(new ApiErrors('Password was changed! Please log in again', 401))
    }
    req.user = currentUser
    next()
})

exports.restrictTo = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new ApiErrors('You do not have permission to perform this action', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ApiErrors('No user with that email address', 404))
    }

    const resetToken = user.generateUserResetToken()
    await user.save({ validateBeforeSave: false })

    try {
        const resUrl = `${req.protocol}://${req.get('host')}/${req.originalUrl}/${resetToken}`

        const message = `Forgot your password? Please use link ${resUrl} and reset it.`

        await sendEmail({
            email: user.email,
            subject: 'Your link is active for 10min',
            message
        })

        res.status(200).json({
            status: "success",
            message: "Check your mail"
        })
    } catch (e) {
        user.passwordResetToken = undefined
        user.passwordExpiresDate = undefined
        await user.save({ validateBeforeSave: false })
        return next(new ApiErrors('Something went wrong. Please try again later', 500))
    }
})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex')

    console.log(req.params, hashedToken)

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordExpiresDate: { $gt: Date.now() }
    })

    if (!user) return next(new ApiErrors('Token was expired! Please try reset again'))

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordExpiresDate = undefined

    await user.save()

    await sendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // find user
    const user = await User.findById(req.user.id).select('+password')

    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new ApiErrors('Current password is wrong!'))
    }

    // Change user password
    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm

    // Save user updated data
    await user.save()

    // Create token and send response
    sendToken(user, 200, res)
})
