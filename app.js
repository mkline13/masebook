
const http = require("http");
const express = require("express");
const routes = require("./routes");


// Create app object: manages URL routing
const app = express();


// Configure server settings
const port = process.env.PORT ?? 10000;

// TODO: SSL STUFF ADD LATER
// const serverOptions = {
//     key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
//     cert: fs.readFileSync(path.join(__dirname, '../ssl/server.cert')),
// }
serverOptions = {};

// Add routes
app.use("/", routes.pageRoutes);
app.use("/api", routes.apiRoutes);


// Start server
const server = http.createServer(serverOptions, app).listen(port, () => {
    console.log(`Listening on port ${port}...`)
});
