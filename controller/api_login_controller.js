import bcrypt from 'bcryptjs';

export default async function api_login_controller(req, res) {
    // TODO: is this secure?
    const client_email = req.body.email;
    const client_password = req.body.password;

    const qres = await req.db.query("SELECT email, hashed_password, account_status FROM users WHERE email = $1;", [client_email]);
    const server_result = qres.rows?.[0];

    if (server_result === undefined || server_result.account_status != 'active') {
        return res.status(401).send('Invalid username or password');
    }

    bcrypt.compare(client_password, server_result.hashed_password, (err, success) => {
        if (success) {
            req.session.regenerate(function (err) {
                if (err) next(err);

                req.session.user = req.body.email;

                req.session.save(function (err) {
                    if (err) return next(err);
                    if (req.query.redirect) {
                        // Redirects browser to URL specified in "?redirect=" query param
                        return res.redirect(req.query.redirect); // TODO: hackable by injecting invalid redirect string?
                    } else return res.redirect('/');
                });
            });
        }
        else {
            res.status(401).send('Invalid username or password');
        }
    });
}