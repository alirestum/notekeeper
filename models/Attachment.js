const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
    note:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Note'
    },
    name: {
        type: String
    },
    url: {
        type: String
    }
});

const Attachment = mongoose.model('Attachment', AttachmentSchema);

module.exports = Attachment;
