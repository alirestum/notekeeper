const mongoose = require('mongoose');
const Attachment = require('./Attachment');
const Note = require('./Note');

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
    },
    notes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
});

const User = mongoose.model('User', UserSchema);

module.exports.user = User;
