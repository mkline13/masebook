import dashboard_page_controller from '../controller/dashboard_page_controller.js';
import login_page_controller from '../controller/login_page_controller.js';

import api_login_controller from '../controller/api_login_controller.js';
import api_logout_controller from '../controller/api_logout_controller.js';
import api_dashboard_controller from '../controller/api_dashboard_controller.js';
import api_users_controller from '../controller/api_users_controller.js';

import dummy_page_controller from './dummy_page_controller.js';

// MIDDLEWARE
function checkAuth(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

function checkAuthAPI(req, res, next) {
    if (req.session.user) next();
    else res.status(401).send("not authenticated");
}

// Adds routes to the provided app using the provided database
export default function routes(app, db) {
    // Middleware to get sidebar data from the DB
    const getSidebarData = async (req, res, next) => {
        const query_result = await db.query("SELECT id, display_name FROM users WHERE email = $1;", [req.session.user]);

        // TODO: write postgres function for getting sidebar data
        // TODO: cache sidebar data?

        res.locals.user = {
            id: query_result.rows[0].id,
            name: query_result.rows[0].display_name,
            spaces: ["A", "B", "C"],
            member_of: ["X", "Y", "Z"],
            new_messages: 69
        }
        next();
    }

    // PAGE ROUTES
    app.get("/", checkAuth, getSidebarData, dashboard_page_controller(db));
    app.get("/login", login_page_controller()); // TODO: make login redirect to correct page after successful auth (say user initially tries to go to directory but is redirected to login)
    app.get("/directory", checkAuth, getSidebarData, (req, res) => { res.render('directory'); });
    app.get("/settings", checkAuth, dummy_page_controller("settings page"));

    // API ROUTES
    app.post("/api/login", api_login_controller(db));
    app.get("/api/logout", api_logout_controller());
    app.get("/api/dashboard", checkAuthAPI, api_dashboard_controller(db));
    app.get("/api/users", checkAuthAPI, api_users_controller(db));
}