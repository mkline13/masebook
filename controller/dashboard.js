import express from 'express';
import { expand } from '../helpers/transformers.js';

const router = express.Router();
export default router;


router.route('/')
    // GET DASHBOARD
    .get(async (req, res) => {
        const user = res.locals.user;

        // get pokes
        let query = {
            text: `SELECT sender_id, poke_type FROM pokes WHERE recipient_id=$1;`,
            values: [user.id]
        }

        let result;
        try {
            result = await req.db.query(query);
            res.locals.pokes = result.rows;

        }
        catch (error) {
            res.status(500).send('server error');
        }

        // get posts
        query = {
            text:  `SELECT
                        p.*,
                        s.shortname AS "space.shortname",
                        s."settings.title" AS "space.title",
                        u.shortname AS author_name
                    FROM
                        posts p
                        INNER JOIN follows f
                            ON f.space_id=p.space_id
                            AND f.user_id=$1
                        INNER JOIN users u
                            ON u.id=f.user_id
                        INNER JOIN spaces s
                            ON s.id=f.space_id
                        ORDER BY p.creation_date DESC;`,
            values: [user.id]
        }

        try {
            result = await req.db.query(query);
            res.locals.feed = result.rows.map(expand);
        }
        catch (error) {
            res.status(500).send('server error');
        }

        res.render('dashboard');
    });