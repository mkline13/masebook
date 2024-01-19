import express from 'express';
import { levelToRole } from '../public/js/masebook.js';
import { expand } from '../helpers/transformers.js';

const router = express.Router();
export default router;

router.route('/')
    .get(async (req, res) => {
        // Displays a list of all users on the server
        const data = {};
        {
            const query = {
                name: "get_users_for_directory",
                text:  `SELECT
                            id,
                            shortname,
                            account_type
                        FROM
                            users
                            WHERE account_status='active'
                            AND "settings.show_in_dir"=true
                            OR id=$1
                            ORDER BY account_type DESC, shortname;`,
                values: [req.session.user.id]  // to ensure current user is shown
            }
            const result = await req.db.query(query);
            res.locals.users = expand(result.rows);
        }
        {
            const query = {
                name: "get_spaces_for_directory",
                text:  `SELECT
                            s.id, s.shortname, s."settings.title" AS title, m.user_role AS role
                        FROM
                            spaces s
                            LEFT JOIN memberships m
                                ON m.space_id=s.id AND m.user_id=$1
                            WHERE m.user_role IS NOT NULL
                                OR s."settings.public"=true
                                AND s."settings.show_in_dir"=true
                            ORDER BY m.user_role DESC NULLS LAST, s."settings.title" ASC;`,
                values: [req.session.user.id]
            };
            const result = await req.db.query(query);
            res.locals.spaces = result.rows;
        }

        // swap in role names
        for (let i=0; i<res.locals.spaces.length; i++) {
            res.locals.spaces[i].role = levelToRole[res.locals.spaces[i].role ?? 0]
        }
        res.render('directory');
    })