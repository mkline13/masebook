const db = require('../model/db');
const bcrypt = require('bcryptjs');


const login_controller = async (req, res) => {
    // TODO: sanitize email
    // TODO: sanitize password

    const client_email = req.body.email;
    const client_password = req.body.password;

    const query_result = await db.query("SELECT email, hashed_password, account_status FROM users WHERE email = $1;", [client_email]);
    const server_result = query_result.rows?.[0];

    if (server_result === undefined || server_result.account_status != 'active') {
        return res.send('Invalid username or password');
    }

    bcrypt.compare(client_password, server_result.hashed_password, (err, success) => {
        if (success) {
            req.session.regenerate(function (err) {
                if (err) next(err);
        
                req.session.user = req.body.email;
        
                req.session.save(function (err) {
                    if (err) return next(err);
                    return res.redirect('/');
                });
            });
        }
        else {
            res.send('Invalid username or password');
        }
    });
}


module.exports = login_controller;