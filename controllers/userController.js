const fs = require('fs')
const catchAsync = require('./../utils/catchAsync')
const ApiErrors = require('./../utils/apiErrors')
const User = require('./../models/userModel')
const factory = require('./handleFactory')

const filterObj = (body, ...fields) => {
    const newObj = {}
    Object.keys(body).forEach(el => {
        if (fields.includes(el)) newObj[el] = body[el]
    })
    return newObj
}

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find()

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.updateMe = async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new ApiErrors(
            'You cant update password now. This route is not for password update',
            400
        ))
    }

    const filteredObject = filterObj(req.body, 'email', 'name')
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObject,
{
        new: true,
        runValidators: true
    })


    res.status(200).json({
        status: 'success',
        message: 'Success',
        data: {
            user: updatedUser

        }
    })
}

exports.createUser = (req, res) => {
    res.status(201).json({
        status: 'success',
        data: {
            user: '<Here must be user data/>'
        }
    })
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id
    next()
}

exports.getUser = factory.getOne(User)

exports.updateUser = factory.updateOne(User)

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })

    res.status(204).json({
        status: 'success',
        message: 'User was deleted'
    })
})

exports.deleteUser = factory.deleteOne(User)
