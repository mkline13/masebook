import dashboard_page_controller from '../controller/dashboard_page_controller.js';
import login_page_controller from '../controller/login_page_controller.js';
import api_login_controller from '../controller/api_login_controller.js';
import api_logout_controller from '../controller/api_logout_controller.js';
import api_dashboard_controller from '../controller/api_dashboard_controller.js';

// MIDDLEWARE
function checkAuth(req, res, next) {
    // this function should work if express-session is working properly
    if (req.session.user) next();
    else res.redirect('/login');
}

// Adds routes to the provided app using the provided database
export default function routes(app, db) {
    // PAGE ROUTES
    app.get("/", checkAuth, dashboard_page_controller(db));
    app.get("/login", login_page_controller());

    // API ROUTES
    app.post("/api/login", api_login_controller(db));
    app.get("/api/logout", api_logout_controller());
    app.get("/api/dashboard", api_dashboard_controller(db));
}