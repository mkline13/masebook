
const http = require("http");
const express = require("express");
const sessions = require("express-session");
const routes = require("./controller/routes");


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

// Add routes
app.use("/", routes);


// TODO: SSL STUFF ADD LATER
// const serverOptions = {
//     key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
//     cert: fs.readFileSync(path.join(__dirname, '../ssl/server.cert')),
// }
serverOptions = {};

// Start server
const server = http.createServer(serverOptions, app).listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)
});
