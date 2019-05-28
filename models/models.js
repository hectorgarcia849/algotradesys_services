const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const _ = require('lodash');


const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        minlength: 1,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => { return validator.isEmail(value)},
            message: '{VALUE} is not a valid email'
        }
    },
    password:{
        type: String,
        require: true,
        minlength: 6
    }
});

UserSchema.methods.generateAuthToken = function() {

    const user = this;
    const access = 'auth';
    return jwt.sign({_id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

};

UserSchema.methods.toJSON = function() {
    // prevents password and tokens from being revealed
    const user = this;
    const userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email'])

};

UserSchema.statics.findByCredentials = function(email, password) {

    const User = this;

    return User.findOne({ email }).then(user => {

        if(!user) {
          return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if(res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

UserSchema.pre('save', function(next) {

    const user = this;

    if(user.isModified('password'))
    {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);
module.exports = { User };
