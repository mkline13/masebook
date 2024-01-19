import bcrypt from 'bcryptjs';
import { expand } from '../helpers/transformers.js';

export async function login_controller(req, res) {
    // TODO: VALIDATE INPUTS
    const client_email = req.body.email;
    const client_password = req.body.password;

    const query = {
        text:  `SELECT * FROM users WHERE email=$1;`,
        values: [client_email]
    };

    const result = await req.db.query(query);
    const server_user = result.rows?.[0];

    //TODO: still vulnerable to timing attack?
    //TODO: what happens if hashed password is undefined? Does that make it hackable? Probably not because of salt...?
    bcrypt.compare(client_password, server_user?.password, (err, success) => {
        if (success && server_user.account_status == 'active') {
            req.session.regenerate(function (err) {
                if (err) next(err);

                req.session.user = expand(server_user);

                req.session.save(function (err) {
                    if (err) return next(err);
                    if (req.query.redirect && req.query.redirect.charAt(0) == "/") { // ensure redirect doesn't leave site
                        // Redirects browser to URL specified in "?redirect=" query param
                        return res.redirect(req.query.redirect); // TODO: hackable by injecting invalid redirect string?
                    } else return res.redirect('/');
                });
            });
        }
        else {
            res.status(401).send('Invalid username and/or password');
        }
    });
}

export function logout_controller(req, res) {
    req.session.user = null;
    
    req.session.save(function (err) {
        if (err) return next(err);

        req.session.regenerate(function (err) {
            if (err) next(err);
            return res.redirect('/');
        });
    });
}
