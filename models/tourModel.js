const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')

const User = require('./userModel')

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        unique: true,
        trim: true,
        minlength: [10, 'Min length of the name must be more or equal 10 characters'],
        maxlength: [40, 'Min length of the name must be less or equal 40 characters']
        //validate: [validator.isAlpha, 'Tour name must contains only characters']
    },
    duration: {
        type: Number,
        required: [true, 'A duration is required']
    },
    rating: {
        type: Number,
        default: 4.5,
        required: true
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Min rating average can be 1'],
        max: [5, 'Max rating average can be 5']
    },
    ratingsQuantity: {
        type: Number,
    },
    images: {
        type: [String]
    },
    startDates: {
        type: [Date]
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A group size is required']
    },
    difficulty: {
        type: String,
        required: [true, 'A difficulty is required'],
        trim: true,
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty must be: easy, medium or difficult'
        }
    },
    summary: {
        type: String,
        required: [true, 'A summary is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        // required: [true, 'A cover image is required']
    },
    created_at: {
        type: Date,
        default: Date.now(),
        select: false
    },
    price: {
        type: Number,
        required: [true, 'A tour must have price']
    },
    discountPrice: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price
            },
            message: 'Discount price ({VALUE}) must be less than price'
        }
    },
    slug: String,
    secretTour: {
        type: Boolean,
        default: false
    },
    start: Number,
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        address: String,
        description: String,
        coordinates: [Number]
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            day: Number,
            description: String,
            coordinates: [Number]
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
    //guides: Array
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})

tourSchema.virtual('review', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

// Document Middlewave for create and update one tour

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name.toLowerCase())
    next()
})

// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })

// Query Middleware

tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    next()
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    })
    next()
})

// Aggregation Middleware

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    next()
})


const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
