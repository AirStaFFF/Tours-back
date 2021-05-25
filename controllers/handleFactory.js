const catchAsync = require('./../utils/catchAsync')
const ApiErrors = require('./../utils/apiErrors')

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc) {
        return next(new ApiErrors('This id is invalid'), 404)
    }
    res.status(204).json({
        status: 'deleted',
        message: 'Document was deleted'
    })
})


exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidations: true
    })

    if (!item) {
        return next(new ApiErrors('This id is invalid'), 404)
    }

    res.status(200).json({
        status: 'success',
        data: {
            item
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const item = await Model.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            item
        }
    })
})

exports.getOne = (Model, populationOpt = '') => catchAsync(async (req, res, next) => {
    const item = await Model.findById(req.params.id).populate(populationOpt)

    if (!item) {
        return next(new ApiErrors('This id is not valid!', 404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            item
        }
    })
})
