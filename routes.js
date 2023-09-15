const express = require("express");
const path = require('path');
const db = require('./db');

const routes = express.Router();

// MIDDLEWARE
function checkAuth(req, res, next) {
    // this function should work if express-session is working properly
    if (req.session.user) next();
    else res.redirect('/login');
}

// PAGE ROUTES
routes.get("/", checkAuth, require("./controller/dashboard_page_controller"));
routes.get("/login", require("./controller/login_page_controller"));

// API ROUTES
routes.post("/api/login", require("./controller/api_login_controller"));
routes.get("/api/logout", require("./controller/api_logout_controller"));


module.exports = routes;