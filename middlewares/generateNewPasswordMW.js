module.exports = function (bcrypt) {

    return function (req, res, next) {
        if(res.locals.error === undefined) {
            let newPW = '';
            let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let charactersLength = characters.length;
            for (let i = 0; i < 7; i++) {
                newPW += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    res.locals.error = err;
                    return next();
                } else {
                    bcrypt.hash(newPW, salt, (err, hash) => {
                        if (err) {
                            res.locals.error = err;
                            return next();
                        } else {
                            res.locals.newpw = newPW;
                            res.locals.newpwHashed = hash;
                            return next();
                        }
                    });
                }
            });
        } else{
            next();
        }
    }
}