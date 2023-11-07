import dashboard_page_controller from '../controller/dashboard_page_controller.js';
import login_page_controller from '../controller/login_page_controller.js';
import space_page_controller from '../controller/space_page_controller.js';
import space_info_page_controller from './space_info_page_controller.js';

import api_login_controller from '../controller/api_login_controller.js';
import api_logout_controller from '../controller/api_logout_controller.js';
import api_dashboard_controller from '../controller/api_dashboard_controller.js';
import api_users_controller from '../controller/api_users_controller.js';
import {get_spaces, create_space} from '../controller/api_space_controller.js'

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
    // Middleware to get sidebar data from the DB
    const getSidebarData = async (req, res, next) => {
        const qres = await req.db.query("SELECT id, display_name FROM users WHERE email = $1;", [req.session.user]);

        // TODO: write postgres function for getting sidebar data
        // TODO: cache sidebar data?

        res.locals.user = {
            id: qres.rows[0].id,
            name: qres.rows[0].display_name,
            spaces: ["A", "B", "C"],
            member_of: ["X", "Y", "Z"],
            new_messages: 69
        }
        next();
    }

    const getClientUserInfo = async (req, res, next) => {
        const qres = await req.db.query("SELECT id, email, display_name FROM users WHERE email = $1;", [req.session.user]);
        res.locals.user = {
            id: qres.rows[0].id,
            email: qres.rows[0].email,
            name: qres.rows[0].display_name
        }
        next();
    }

    // PAGE ROUTES
    app.get("/", checkAuth, getSidebarData, dashboard_page_controller);
    app.get("/login", login_page_controller); // TODO: make login redirect to correct page after successful auth (say user initially tries to go to directory but is redirected to login)
    app.get("/directory", checkAuth, getSidebarData, (_, res) => { res.render('directory'); });
    app.get("/settings", checkAuth, getSidebarData, (_, res) => { res.render('settings'); });  // TODO:
    app.get("/space?s", checkAuth, getSidebarData, (_, res) => { res.render('spaces'); });
    app.get("/space/:space_id", checkAuth, getSidebarData, space_page_controller);
    app.get("/space/:space_id/info", checkAuth, getSidebarData, space_info_page_controller);

    // API ROUTES
    app.post("/api/login", api_login_controller);
    app.get("/api/logout", api_logout_controller);
    app.get("/api/dashboard", checkAuthAPI, api_dashboard_controller);
    app.get("/api/users", checkAuthAPI, api_users_controller);

    // TODO:
    app.get("/api/space", checkAuthAPI, getClientUserInfo, get_spaces);
    app.post("/api/space", checkAuthAPI, getClientUserInfo, create_space);

    app.get("/api/space/:space_id(\d+)", checkAuthAPI, create_dummy_response("/api/space/:space_id GET [retrieves posts in a space]"));
    app.post("/api/space/:space_id(\d+)", checkAuthAPI, create_dummy_response("/api/space/:space_id POST [creates new post in a space]"));
}