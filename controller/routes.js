import dashboard_page_controller from '../controller/dashboard_page_controller.js';
import login_page_controller from '../controller/login_page_controller.js';
import space_page_controller from '../controller/space_page_controller.js';
import space_info_page_controller from './space_info_page_controller.js';

import {login_controller, logout_controller} from './auth.js';

import api_dashboard_controller from '../controller/api_dashboard_controller.js';
import {get_users, create_user} from './user_api_controllers.js';
import {get_spaces, create_space} from '../controller/space_api_controllers.js'

// MIDDLEWARE
function checkAuth(req, res, next) {
    if (req.session.user) next();
    else {
        const url = req.url;
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
    app.get("/login", login_page_controller); // TODO: make login redirect to correct page after successful auth (say user initially tries to go to directory but is redirected to login)
    app.post("/login", login_controller);
    app.get("/logout", logout_controller);

    // PAGE ROUTES
    app.get("/", checkAuth, user_info_to_locals, dashboard_page_controller);
    app.get("/directory", checkAuth, user_info_to_locals, (_, res) => { res.render('directory'); });
    app.get("/settings", checkAuth, user_info_to_locals, (_, res) => { res.render('settings'); });  // TODO:
    app.get("/space", checkAuth, user_info_to_locals, (_, res) => { res.render('spaces'); });
    app.get("/space/:space_id", checkAuth, user_info_to_locals, space_page_controller);
    app.get("/space/:space_id/info", checkAuth, user_info_to_locals, space_info_page_controller);

    // API ROUTES
    app.get("/api/dashboard", checkAuthAPI, api_dashboard_controller);
    app.get("/api/user", checkAuthAPI, get_users);
    app.post("/api/user", checkAuthAPI, create_user);

    // TODO:
    app.get("/api/space", checkAuthAPI, get_spaces);
    app.post("/api/space", checkAuthAPI, create_space);

    app.get("/api/space/:space_id(\d+)", checkAuthAPI, create_dummy_response("/api/space/:space_id GET [retrieves posts in a space]"));
    app.post("/api/space/:space_id(\d+)", checkAuthAPI, create_dummy_response("/api/space/:space_id POST [creates new post in a space]"));
}