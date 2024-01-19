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
        const sql = "SELECT * FROM users WHERE id=$1;";
        const result = await req.db.query(sql, [req.params.user_id]);
        res.locals.profile = expand(result.rows[0]);
        res.render('user_profile');
    })