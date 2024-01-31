import express from 'express';
import bcrypt from 'bcryptjs';

import { expand } from '../helpers/transformers.js';
import { validatePokeRequest, validateShortname } from '../helpers/validation.js';

const router = express.Router();
export default router;

const saltRounds = 10;


export async function getUserProfile (req, res, next) {
    // check shortname
    const validShortname = validateShortname(req.params.user_id);
    if (!validShortname) {
        res.status(400).send('bad url');
        return;
    }

    // TODO: implement friendship or some way to make user visible to others via the link
    // right now all users are accesible from the link
    const pokeSender = res.locals.user;
    const query = {
        text:  `SELECT 
                    u.id,
                    u.shortname,
                    u.account_type,
                    u.email,
                    u."settings.show_in_dir",
                    u."settings.profile_desc",
                    p.poke_type
                FROM
                    users u
                    LEFT JOIN pokes p
                        ON p.recipient_id=u.id
                        AND p.sender_id=$1
                    WHERE u.shortname=$2;`,
        values: [pokeSender.id, req.params.user_id]
    };
    
    let result;
    try {
        result = await req.db.query(query);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('server error');
        return;
    }
    
    if (result.rows[0] === undefined) {
        res.status(404).send("not found");
        return;
    }
    
    const user = expand(result.rows[0]);
    res.locals.profile = user;

    next();
}

router.route('/')
    // get list of users
    .get(async (req, res) => {
        res.status(308).redirect('/directory');
    })
    // Creates a new user
    .post(async (req, res) => {
        res.status(501).send("Not implemented");
    });

router.route('/:user_id')
    // view a user's profile
    .get(getUserProfile, async (req, res) => {
        res.render('user_profile');
    });


router.route('/:user_id/poke')
    // create a poke
    .post(getUserProfile, async (req, res) => {
        const sender = res.locals.user;
        const recipient = res.locals.profile;

        if (sender.id === recipient.id) {
            res.status(400).send('cannot poke yourself');
            return;
        }

        if (!validatePokeRequest(req.body)) {
            res.status(422).send('invalid request');
            return;
        }

        const poke = req.body;

        const query = {
            text: `INSERT INTO pokes(sender_id, recipient_id, poke_type) VALUES ($1,$2,$3)`,
            values: [sender.id, recipient.id, poke.type]
        }

        try {
            await req.db.query(query);
        }
        catch (error) {
            if (error.constraint === 'pokes_sender_id_recipient_id_key') {
                res.status(403).send('cannot poke multiple times');
            }
            else {
                console.error(error);
                res.status(500).send('server error');
            }
            return;
        }

        res.status(201).send(recipient.shortname);
    })