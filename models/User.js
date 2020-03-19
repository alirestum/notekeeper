const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', UserSchema);

const findUserByUsername = async function (username) {
    await User.find().where('username').equals(username).exec().then( user => {
        return user[0];
    });
};

const findUserById = async function (id) {

};

module.exports.user = User;
module.exports.findUserByUsername = findUserByUsername;

