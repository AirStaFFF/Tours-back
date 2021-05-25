const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required. Please add name!'],
        minlength: [2, 'Min length of name is 2']
    },
    email: {
        type: String,
        required: [true, 'Email is required. Please add email!'],
        trim: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email isn\'t valid']
    },
    photo: {
        type: String
    },
    password: {
        type: String,
        required: [true, 'Provide a password'],
        minLength: [8, 'Min length is 8'],
        select: false
    },
    passwordConfirm: {
        type: String,
        validate: {
            validator: function (pass) {
                return pass === this.password
            }
        },
        required: [true, 'Provide a password']
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: {
            values: ['guide', 'lead-quide', 'user', 'admin'],
            message: 'Role must be: guide, user, admin'
        },
        default: "user"
    },
    passwordResetToken: String,
    passwordExpiresDate: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    this.passwordChangedAt = Date.now() - 1000
    next()
})

userSchema.pre(/^find/, function (next) {
    this.find({ active: { $ne: false } })
    next()
})

userSchema.methods.correctPassword = async function(password, userPassword) {
    return await bcrypt.compare(password, userPassword)
}

userSchema.methods.changedIsPassword = async function(JWTExpiredDate) {
    if (this.passwordChangedAt) {
        const encodedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTExpiredDate < encodedTime
    }
    return false
}

userSchema.methods.generateUserResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordExpiresDate = Date.now() + 10 * 60 * 1000
    return resetToken
}

const User = mongoose.model('User', userSchema)
module.exports = User
