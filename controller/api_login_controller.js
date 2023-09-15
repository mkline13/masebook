const db = require('../model/db');


const hash = (inp) => {
    // TODO: properly hash passwords
    return inp;
}


const login_controller = async (req, res) => {
    // TODO: sanitize email
    // TODO: sanitize password

    const client_email = req.body.email;
    const client_hashed_password = hash(req.body.password);

    const server_result = (await db.query("SELECT email, hashed_password, account_status FROM users WHERE email = $1;", [client_email])).rows[0];

    if (client_email !== server_result.email || client_hashed_password !== server_result.hashed_password || server_result.account_status != 'active') {
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