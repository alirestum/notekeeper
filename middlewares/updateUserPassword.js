module.exports = function (UserRepository) {

    return function (req, res, next) {
        if( res.locals.error === undefined) {
            UserRepository.findOneAndUpdate({username: req.body.username}, {password: res.locals.newpwHashed}, {}, (err, doc) => {
                if (err) {
                    res.locals.error = err;
                    res.locals.success_msg = false;
                    next();
                } else {
                    res.locals.success_msg = true;
                    next();

                }
            });
        } else{
            next();
        }
    }
}
