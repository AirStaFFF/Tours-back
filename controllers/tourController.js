const Tour = require('./../models/tourModel')

const ApiFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const ApiErrors = require('./../utils/apiErrors')
const factory = require('./handleFactory')

exports.aliasTours = async (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'price,name,description,ratingsAverage'
    next()
}

exports.getTours = catchAsync(async (req, res) => {
    const features = new ApiFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    const tours = await features.query

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: tours
    })
})

exports.createTour = factory.createOne(Tour)

exports.getTour = factory.getOne(Tour, 'review')

exports.updateTour = factory.updateOne(Tour)

exports.deleteTour = factory.deleteOne(Tour)

exports.getTourStatus = catchAsync(async (req, res) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRating: { $sum: '$ratingsQuantity' },
                avgPrice: { $avg: '$price' },
                avgRating: { $avg: '$ratingsAverage' },
                maxPrice: { $max: '$price' },
                minPrice: { $min: '$price' }
            }
        },
        {
            $sort: { numTours: -1 }
        }
    ])
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    })
})

exports.getMonthlyPlan = catchAsync(async (req, res) => {
    const year = req.params.year * 1

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: { $gte: new Date(`${year}-01-01`) },
                startDates: { $lte: new Date(`${year}-12-31`) },
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                name: {
                    $push: {
                        name: '$name',
                        id: '$_id'
                    }
                }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $limit: 12
        },
        {
            $sort: {
                numTourStarts: -1
            }
        }
    ])


    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    })
})
