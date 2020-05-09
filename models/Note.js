const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

const NoteSchema = new mongoose.Schema({
    noteId:{
        type: Number
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    lastModified: {
        type: Date
    },
    tags: {
        type: [{type: String}]
    },
    attachments: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Attachment'}]
    }
});

autoIncrement.initialize(mongoose.connection);

NoteSchema.plugin(autoIncrement.plugin, {model: 'Note', field: 'noteId', startAt: 1});

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;
