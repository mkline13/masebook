const express = require("express");
const path = require('path');
const db = require('./db');

const routes = express.Router();

function checkAuth(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

routes.get("/", checkAuth, (req, res) => {
    res.render('dashboard', { username: req.session.user });
});

routes.get("/login", (req, res) => {
    // redirect to home page if logged in
    if (req.session.user) {
        return res.redirect('/');
    }

    res.render('login');
});


// API ROUTES
routes.post("/api/login", (req, res) => {
    // TODO: sanitize email
    // TODO: sanitize password

    if (req.body.email !== 'mkline13@gmail.com' || req.body.password !== 'b0bb0') {
        return res.send('Invalid username or password');
    }

    req.session.regenerate(function (err) {
        if (err) next(err);

        req.session.user = req.body.email;

        req.session.save(function (err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    });
});

routes.get("/api/logout", (req, res) => {
    req.session.user = null;
    
    req.session.save(function (err) {
        if (err) return next(err);

        req.session.regenerate(function (err) {
            if (err) next(err);
            return res.redirect('/');
        });
    });
});


module.exports = routes;