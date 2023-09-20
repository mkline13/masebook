import express from 'express';

import dashboard_page_controller from '../controller/dashboard_page_controller.js';
import login_page_controller from '../controller/login_page_controller.js';
import api_login_controller from '../controller/api_login_controller.js';
import api_logout_controller from '../controller/api_logout_controller.js';

const routes = express.Router();
export default routes;

// MIDDLEWARE
function checkAuth(req, res, next) {
    // this function should work if express-session is working properly
    if (req.session.user) next();
    else res.redirect('/login');
}

// PAGE ROUTES
routes.get("/", checkAuth, dashboard_page_controller);
routes.get("/login", login_page_controller);

// API ROUTES
routes.post("/api/login", api_login_controller);
routes.get("/api/logout", api_logout_controller);