

const login_controller = (req, res) => {
    // TODO: sanitize email
    // TODO: sanitize password

    if (req.body.email !== 'mkline13@gmail.com' || req.body.password !== 'b0bb0') {
        return res.send('Invalid username or password');
    }

    req.session.regenerate(function (err) {
        if (err) next(err);

        req.session.user = req.body.email;

        req.session.save(function (err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
}


module.exports = login_controller;