import express from 'express';
import bcrypt from 'bcryptjs';

import { expand } from '../helpers/transformers.js';

const router = express.Router();
export default router;

const saltRounds = 10;

router.route('/')
    .get(async (req, res) => {
        res.status(308).redirect('/directory');
    })
    .post(async (req, res) => {
        // Creates a new user
        res.status(501).send("Not implemented");
    });

router.route('/:user_id')
    .get(async (req, res) => {
        // gets a user's profile
        const sql = "SELECT * FROM users WHERE shortname=$1;";
        const result = await req.db.query(sql, [req.params.user_id]);
        
        if (result.rows[0] === undefined) {
            res.status(404).send("not found");
            return;
        }
        
        const user = expand(result.rows[0]);
        res.locals.profile = user;

        res.render('user_profile');
    })