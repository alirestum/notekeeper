module.exports = function (UserRepository) {
    return function (req, res, next) {
        UserRepository.findOne().where('username').equals(req.body.username).then( (user, err) =>{
           if (err || !user){
               res.locals.error = 'No user with that username!';
               next();
           } else{
               res.locals.user = user;
               next();
           }
        });
    }
}