

const login_controller = (req, res) => {
    // redirect to home page if logged in
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('login');
}

module.exports = login_controller;