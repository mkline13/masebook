const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Authorization-checking middleware: used to validate the client's JWT and reroute as needed
// If the client is logged in, the client's username will be passed to the next middleware in res.locals.user

// This method should be used to provide the client with error codes when using the /api/ routes
const validateTokenForAPIRoutes = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send("Unauthorized request");
    }
    
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
        return res.status(401).send("Access denied. No token provided.");
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.locals.user = decoded.user;
        next()
    } catch (err) {
        res.status(400).send("Invalid token.")
    }
}

// This method should be used to re-route the client back to the login page if auth fails
const validateTokenForPages = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.redirect("/");
    }
    
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
        return res.redirect("/");
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        res.locals.user = decoded.user;
        next()
    } catch (err) {
        return res.redirect("/");
    }
}


// check that email and password belong to a registered user
// Returns new token if email/password combo is valid. Otherwise returns null
const generateTokenIfValidUser = async (email, password) => {
    // TODO: find user in database
    serverUser = null;
    
    // TODO: check password and return null if user invalid
    const passwordValid = await bcrypt.compare(password, serverUser.password)
    passwordValid = false;
    if (!passwordValid) {
        return null
    }

    // otherwise, create token
    const payload = {
        email: email,
        password: password
    }

    const options = {
        expiresIn: "1h"
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return token;
}


module.exports = { validateTokenForAPIRoutes, validateTokenForPages, generateTokenIfValidUser }