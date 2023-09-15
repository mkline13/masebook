

const dashboard_controller = (req, res) => {
    res.render('dashboard', { username: req.session.user });
}


module.exports = dashboard_controller;