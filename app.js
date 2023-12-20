
import express from 'express';
import session from 'express-session';
import path from 'path';
import routes from './controller/routes.js';

import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function createApp(database) {
    const app = express();
    app.set('view engine', 'pug');

    // Configure session settings
    // TODO: Fix
    process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "none";

    if (process.env.SESSION_SECRET == "none") {
        console.log("WARNING, SESSION_SECRET NOT SET!");
    }

    // Install middleware
    app.use(session({
        secret: process.env.SESSION_SECRET,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 24 hours
            secure: false, // TODO: SET THIS TO TRUE AFTER ADDING SSL
        },
        resave: false,
        saveUninitialized: true,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use("/public", express.static(path.join(__dirname, 'public')));

    // ATTACHES USEFUL RESOURCES TO EACH REQUEST
    app.use((req, res, next) => {
        // ensures that database is passed to all routes
        req.db = database;

        next();
    });

    // Add routes
    routes(app);
    return app;
}