//Find the note with the specified id
module.exports = function (NoteRepository) {

    return function (req, res, next) {
        NoteRepository.findOne().where('noteId').equals(req.params.noteId)
            .populate('attachments').then((note, err) => {
            if (err || !note){
                next(err);
            }
            res.locals.note = note;
            next();
        });
    }
}