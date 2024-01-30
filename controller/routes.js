import dashboard from './dashboard.js';

import {login_controller, logout_controller} from './auth.js';
import space_router from './spaces.js';
import users_router from './users.js';
import directory_router from './directory.js';

// MIDDLEWARE
function checkAuth(req, res, next) {
    if (req.session.user) next();
    else {
        const url = req.originalUrl;
        if (url == "/") {
            res.redirect('/login');
        }
        else {
            const encodedURL = encodeURIComponent(url);
            res.redirect(`/login?redirect=${encodedURL}`);
        }
    }
}

function checkAuthAPI(req, res, next) {
    if (req.session.user) next();
    else res.status(401).send("not authenticated");
}

function create_dummy_response (msg) {
    // creates a dummy page controller as a placeholder. Displays the message provided in the parameters.
    return (req, res) => {
        res.status(200).send(`DUMMY RESPONSE: ${msg}<br><br>USER: ${req.session.user}`);
    }
}

// Adds routes to the provided app using the provided database
export default function routes(app) {
    const user_info_to_locals = (req, res, next) => {
        res.locals.user = req.session.user;
        next();
    };

    // AUTH
    app.get("/login", (req, res) => {
        // redirect to home page if logged in
        if (req.session.user) {
            return res.status(303).redirect('/');
        }
        res.render('login');
    });

    app.post("/login", login_controller);
    app.get("/logout", logout_controller);

    // ROUTERS
    app.use('/s', checkAuth, user_info_to_locals, space_router);
    app.use('/u', checkAuth, user_info_to_locals, users_router);
    app.use('/directory', checkAuth, user_info_to_locals, directory_router);

    // ROUTES
    app.get("/", checkAuth, user_info_to_locals, dashboard);
    app.get("/settings", checkAuth, user_info_to_locals, (_, res) => { res.render('settings'); });  // TODO: build settings page
    app.get("/new-space", checkAuth, user_info_to_locals, (_, res) => { res.render('new-space'); })
}