const express = require("express");
const path = require('path');

const routes = express.Router();

function checkAuth(req, res, next) {
    if (req.session.user) next();
    else return res.redirect('/login');
}

routes.get("/", checkAuth, (req, res) => {
    return res.sendFile(__dirname + '/pages/dashboard.html');
});

routes.get("/login", (req, res) => {
    // redirect to home page if logged in
    if (req.session.user) {
        return res.redirect('/');
    }

    return res.sendFile(__dirname + '/pages/login.html');
});

routes.post("/api/login", (req, res) => {
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