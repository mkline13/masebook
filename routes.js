const express = require("express");
const router = express.Router();
const auth = require("./auth");

router.use(express.json());

router.get("/", auth.determineUser, (req, res) => {
    if (res.locals.user) {
        res.status(200).send("Logged in!  user: ", res.locals.user);
    }
    else if (res.locals.error) {
        res.status(res.locals.status).send(res.locals.error);
    }
    else {
        res.status(200).send("Not logged in. <><> Should not display!")
    }
});

module.exports = router;