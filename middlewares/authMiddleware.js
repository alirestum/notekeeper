module.exports = {

    /*
    * If the user is not authenticated, then go to login page.
    */
    ensureAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/auth/login');
    },

    /*
    * If the user is authenticated, then skip login / registration page and go to the dashboard.
    */
    forwardAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/dashboard');
    }
};
