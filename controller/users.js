import express from 'express';
import bcrypt from 'bcryptjs';

import { foldUser } from '../public/js/masebook.js';


const router = express.Router();
export default router;

const saltRounds = 10;

router.route('/')
    .get(async (req, res) => {
        res.redirect('/directory');
    })
    .post(async (req, res) => {
        // Creates a new user

        // check that user is allowed to do this action
        const user = req.session.user;
        if (user.account_type != 'administrator') {
            res.status(401).send("User is not authorized to create other users");
            return;
        }

        // TODO: validate / prep these fields for storage
        const email = req.body.email;
        const password = req.body.password;
        const display_name = req.body.display_name;
        const show_in_dir = req.body.show_in_dir ?? false;

        const hashed_password = await bcrypt.hash(password, saltRounds);

        const sql = "INSERT INTO users(email, hashed_password, display_name, show_in_dir) VALUES($1, $2, $3, $4) RETURNING id, email, display_name, show_in_dir;";
        const values = [email, hashed_password, display_name, show_in_dir];
        const query = await req.db.query(sql, values);
        res.json(query.rows[0]);
    });

router.route('/:user_id')
    .get(async (req, res) => {
        // gets a user's profile
        const sql = "SELECT * FROM users WHERE id=$1;";
        const result = await req.db.query(sql, [req.params.user_id]);
        res.locals.profile = foldUser(result.rows[0]);
        res.render('user_profile');
    })
    .post(async (req, res) => {
        // creates a new user
        res.send('not implemented');
    });