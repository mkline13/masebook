const express = require("express");
const auth = require("./auth");


const pageRoutes = express.Router();
pageRoutes.use(express.json());

pageRoutes.get("/", auth.validateTokenForPublicPages, (req, res) => {
    if (res.locals.user) {
        res.status(200).send("Logged in!  user: ", res.locals.user);
    }
    else {
        res.status(200).send("Not logged in.");
    }
});


const apiRoutes = express.Router();
apiRoutes.use(express.json());

apiRoutes.get("/login", (req, res) => {
    res.status(200).send("Logged in!");
})


module.exports = { pageRoutes, apiRoutes };