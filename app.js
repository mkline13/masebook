
import { createServer } from 'http';
import express from 'express';
import sessions from 'express-session';
import path from 'path';
import routes from './controller/routes.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


// Create app object: manages URL routing
const app = express();
app.set('view engine', 'pug');

// Configure server settings
process.env.PORT = process.env.PORT ?? 10000;
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "none";

if (process.env.SESSION_SECRET == "none") {
    console.log("WARNING, SESSION_SECRET NOT SET!");
}

app.use(sessions({
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

// Add routes
app.use("/", routes);


// TODO: SSL STUFF ADD LATER
// const serverOptions = {
//     key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
//     cert: fs.readFileSync(path.join(__dirname, '../ssl/server.cert')),
// }
const serverOptions = {};

// Start server
const server = createServer(serverOptions, app).listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)
});

export default app;