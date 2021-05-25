const mongoose = require('mongoose')
const slugify = require('slugify')

const reviewSchema = mongoose.Schema({
    review: String,
    rating: {
        type: String,
        min: [1, 'Min value is 1'],
        max: [5, 'Max value is 5']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // })
    next()
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
