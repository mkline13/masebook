import express from 'express';
import { buildInsertQuery } from '../helpers/query_builders.js';
import { validateNewSpaceForm, validateShortname } from '../helpers/validation.js';
import { flatten, expand } from '../helpers/transformers.js';

const router = express.Router();
export default router;

async function getSpaceInfo(req, res, next) {
    const user = res.locals.user;
    const space_shortname = req.params.space_id; //TODO: sanitize

    if (!validateShortname(req.params.space_id)) {
        res.status(400).send("invalid parameter");
        return;
    }

    user.space = {};

    // get space info
    const query = {
        text:  `SELECT
                    s.*,
                    COALESCE(m.user_role, 0) AS user_role
                FROM
                    spaces s
                    FULL OUTER JOIN memberships m ON m.space_id=s.id AND m.user_id=$1
                    WHERE s.shortname=$2 AND s.space_status='active';
                `,
        values: [user.id, space_shortname],
    }

    let result;
    try {
        result = await req.db.query(query);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("server error");
        return;
    }

    const data = result.rows[0];
    if (data === undefined) {
        next();
        return;
    }

    // format data correctly
    const space = expand(data);

    // put membership info into user object for tidiness
    user.space.role = space.user_role;
    delete space.user_role;

    // compute settings based on membership
    user.space.visible = space.settings.public || user.space.role !== null;
    user.space.show_in_dir = (space.settings.public && space.settings.show_in_dir) || user.space.role !== null;

    // compute permissions based on membership
    user.space.permissions = {};
    for (const k in space.permissions) {
        user.space.permissions[k] = user.space.role >= space.permissions[k];
    }

    // console.log(res.locals.user.space);
    res.locals.space = space;
    next();
}


/* ROUTES */
router.route('/')
    .get(async (req, res) => {
        res.status(308).redirect('/directory');
    })
    .post(
        async (req, res) => {
            // creates a new space
            const space = req.body;

            // validate/sanitize fields
            const valid = validateNewSpaceForm(space);
            if (!valid) {
                res.status(422).json({ msg: "form validation failure" });
                return;
            }

            // check that unique fields are indeed unique
            {
                const query = {
                    text:  `SELECT
                                BOOL_OR(shortname=$1) AS shortname_exists,
                                BOOL_OR("settings.title"=$2) AS title_exists
                            FROM spaces
                                WHERE shortname=$1
                                OR "settings.title"=$2;`,
                    values: [space.shortname, space.settings.title]
                }

                let shortname_exists, title_exists;
                try {
                    const result = await req.db.query(query);
                    ({shortname_exists, title_exists} = result.rows[0]);
                }
                catch (err) {
                    console.error(err);
                    res.status(500).send({ msg: "unknown error" });
                    return;
                }

                const resObj = {
                    msg: "Unique values required.",
                    issues: {}
                };

                let isError = false;
                if (shortname_exists) {
                    resObj.issues['shortname'] = "shortname must be unique, please choose a different one"
                    isError = true;
                }
                if (title_exists) {
                    resObj.issues['settings.title'] = "title must be unique, please choose a different one"
                    isError = true;
                }

                if (isError) {
                    res.status(422).json(resObj);
                    return;
                }
            }

            // Get creator id from session
            space.creator_id = req.session.user.id;

            // insert into db
            const flattened = flatten(space);
            const query = buildInsertQuery('spaces', flattened);

            try {
                const result = await req.db.query(query);
            }
            catch (err) {
                console.error(err);
                res.status(500).send({ msg: "unknown error" });
                return;
            }

            res.status(303).redirect('/s/' + space.shortname);
        }
    );

router.route('/:space_id')
    .get(getSpaceInfo, async (req, res) => {
        const space = res.locals.space;
        const user = res.locals.user;

        // if space doesn't exist OR is not visible to this particular user, send error
        if (space === undefined || !user.space.visible) {
            res.status(404).send("Not found");
            return;
        }

        // fetch member list
        if (user.space.permissions.view_members) {
            const query = {
                name: "get_member_list_for_space",
                text:  `SELECT
                            m.user_id AS id,
                            m.user_role AS role,
                            u.shortname
                        FROM
                            memberships m
                            JOIN users u ON m.user_id=u.id
                            WHERE m.space_id=$1
                            ORDER BY m.user_role DESC, u.shortname ASC;`,
                values: [space.id]
            }

            let result;
            try {
                result = await req.db.query(query);
            }
            catch (error) {
                console.error(error);
                res.status(500).send('server error');
                return;
            }
            res.locals.people = result.rows;
        }

        // fetch posts
        if (user.space.permissions.view_posts) {
            const query = {
                name: "get_posts_for_space",
                text:  `SELECT
                            p.*,
                            u.shortname AS author_name
                        FROM
                            posts p
                            JOIN users u ON p.author_id = u.id
                            WHERE p.space_id=$1
                            ORDER BY p.id DESC;`,
                values: [space.id]
            }
            let result;
            try {
                result = await req.db.query(query);
            }
            catch (error) {
                console.error(error);
                res.status(500).send('server error');
                return;
            }
            res.locals.posts = result.rows;
        }

        res.render('space');
    })
    .post(getSpaceInfo, async (req, res) => {
        const user = res.locals.user;
        const space = res.locals.space;
        const post_text = req.body.post; // TODO: properly prep post text for storage

        if (!post_text) {
            // TODO: what do I do here?
            res.status(400).send("Cannot submit blank post");
            return;
        }

        if (space === undefined || !user.space.visible) {
            res.status(400).send("No such space");
            return;
        }

        // get permissions
        const can_create_post = user.space.permissions.create_posts;
        if (!can_create_post) {
            res.status(403).send("User does not have post creation privileges in this space");
            return;
        }

        const sql = "INSERT INTO posts(space_id, author_id, contents) VALUES ($1, $2, $3) RETURNING *;";

        let result;
        try {
            result = await req.db.query(sql, [space.id, user.id, post_text]);
        }
        catch (error) {
            console.error(error);
            res.status(500).send('server error');
            return;
        }

        res.status(201).send('OK');
    });