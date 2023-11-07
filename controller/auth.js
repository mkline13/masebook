import bcrypt from 'bcryptjs';

export async function login_controller(req, res) {
    // TODO: is this secure?
    const client_email = req.body.email;
    const client_password = req.body.password;

    const qres = await req.db.query("SELECT id, email, hashed_password, account_status, account_type, display_name FROM users WHERE email = $1;", [client_email]);
    const server_user = qres.rows?.[0];

    if (server_user === undefined || server_user.account_status != 'active') {
        return res.status(401).send('Invalid username or password');
    }

    bcrypt.compare(client_password, server_user.hashed_password, (err, success) => {
        if (success) {
            req.session.regenerate(function (err) {
                if (err) next(err);

                req.session.user = {
                    id: server_user.id,
                    email: server_user.email,
                    account_type: server_user.account_type,
                    display_name: server_user.display_name,
                };

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
