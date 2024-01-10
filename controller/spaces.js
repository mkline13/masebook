import express from 'express';
import { body, checkExact, matchedData, validationResult } from 'express-validator';

import { defaultSpaceSettings, defaultSpacePermissions, levelToRole, mergeFull, mergeExludeDefaults } from '../public/js/masebook.js';

const router = express.Router();
export default router;


async function getSpaceInfo(req, res, next) {
    const user = res.locals.user;
    const space_id = req.params.space_id; //TODO: sanitize

    user.space = {};

    // get space info
    {
        const query = {
            text:  `SELECT
                        s.*,
                        COALESCE(m.user_role, 0) AS user_role,
                        m.show_in_profile
                    FROM
                        spaces s
                        FULL OUTER JOIN memberships m ON m.space_id=s.id AND m.user_id=$1
                        WHERE s.name=$2 AND s.active=true;
                    `,
            values: [user.id, space_id],
        }
        const result = await req.db.query(query);
        res.locals.space = result.rows[0];
    }

    if (res.locals.space === undefined) {
        next(); return;
    }

    const space = res.locals.space;

    // load defaults and merge with settings from the database
    space.settings = mergeFull(defaultSpaceSettings, space.settings);
    space.permissions = mergeFull(defaultSpacePermissions, space.permissions);

    // put membership info into user object for tidiness
    user.space.role = space.user_role;
    delete space.user_role;

    user.space.show_in_profile = space.show_in_profile;
    delete space.show_in_profile;

    // compute settings based on membership
    user.space.visible = space.settings.visible || user.space.role !== null;
    user.space.show_in_dir = (space.settings.visible && space.settings.show_in_dir) || user.space.role !== null;

    // compute permissions based on membership
    user.space.permissions = {};
    for (const k in space.permissions) {
        user.space.permissions[k] = user.space.role >= space.permissions[k];
    }

    // console.log(res.locals.user.space);
    
    next();
}


/* ROUTES */
router.route('/')
    .get(async (req, res) => {
        res.redirect('/directory');
    })
    .post(
        body('settings').isObject(),
        body('permissions').isObject(),
        body('settings.name').trim().notEmpty().escape(),
        body('settings.description').optional().trim().escape().default(''),
        body('settings.visible').optional().isBoolean().default('false'),
        body('settings.show_in_dir').optional().isBoolean().default('false'),
        body('permissions.*').isArray(),
        body('permissions.*.*').isString(),
        async (req, res) => {
            // creates a new space
            const validationErrors = validationResult(req); // TODO: handle validation errors
            const data = matchedData(req);
            data.settings.creator_id = req.session.user.id;

            // TODO: implement

            res.redirect('/directory');
        }
    );


router.route('/new')
    .get(async (req, res) => {
        res.locals.defaults = {
            settings: defaultSpaceSettings,
            permissions: defaultSpacePermissions
        };
        res.locals.roles = levelToRole;
        res.locals.space = {};
        res.render('space_editor');
    })

router.route('/:space_id')
    .head(getSpaceInfo, async (req, res) => {
        // used to check if a space identifier is taken

        const space = res.locals.space;
        const user = res.locals.user;
        console.log(space);
        // if space doesn't exist OR is not visible to this particular user, send error
        if (space === undefined || !user.space.visible) {
            res.status(404).send("Not found");
            return;
        }

        res.status(200).send("OK");
    })
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
                            COALESCE(u.settings->>'display_name', u.username) AS name
                        FROM
                            memberships m
                            JOIN users u ON m.user_id=u.id
                            WHERE m.space_id=$1
                            ORDER BY m.user_role DESC, name ASC;`,
                values: [space.id]
            }
            const result = await req.db.query(query);
            res.locals.people = result.rows;
        }

        // use role names instead of numbers
        if (res.locals.people) {
            for (let i=0; i<res.locals.people.length; i++) {
                res.locals.people[i].role = levelToRole[res.locals.people[i].role];
            }
        }

        // fetch posts
        if (user.space.permissions.view_posts) {
            const query = {
                name: "get_posts_for_space",
                text:  `SELECT
                            p.*,
                            COALESCE(u.settings->>'display_name', u.username) AS author_name
                        FROM
                            posts p
                            JOIN users u ON p.author_id = u.id
                            WHERE space_id=$1
                            ORDER BY p.id DESC;`,
                values: [space.id]
            }
            const result = await req.db.query(query);
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
        const result = await req.db.query(sql, [space.id, user.id, post_text]);
        //TODO: error handling

        res.redirect('back');
    });