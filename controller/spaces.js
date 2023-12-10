import express from 'express';
import { body, checkExact, matchedData, validationResult } from 'express-validator';

const router = express.Router();
export default router;

/* HELPER FUNCTIONS */
function buildParamList(end) {
    const list = [];
    for (let i=1; i<=end; i++) {
        list.push('$' + i);
    }
    return list;
}

function buildInsertQuery(table, obj) {
    // NOTE: this function is not secure. Use data validation before building the query.
    const keys = Object.keys(obj);
    const params = buildParamList(keys.length);
    return {
        text: `INSERT INTO ${table} (${keys.join(',')}) VALUES (${params.join(',')});`,
        values: Object.values(obj)
    };
}

async function getSpaceInfo(req, res, next) {
    // get space info
    const query = {
        text: "SELECT * FROM spaces WHERE id=$1;",
        values: [req.params.space_id]  // TODO: sanitize
    }
    const result = await req.db.query(query);
    const space = result.rows[0];

    space.permissions = {};
    space.min_permissions = {};
    space.user_permissions = {};

    // get permissions
    {
        const query = {
            text:  `SELECT
                        sa.action, sa.min_role, coalesce(sp.role_required, sa.min_role) as role_required
                    FROM
                        space_actions sa
                        LEFT JOIN space_permissions sp ON sa.action = sp.action AND sp.space_id = $1;`,
            values: [space_id]
        }
        const result = await req.db.query(query);
        for (const row of result.rows) {
            space.permissions[row.action] = row.role_required;
            space.min_permissions[row.action] = row.min_role;
        }
    }

    // TODO: calculate user permissions

    res.locals.space = space;
    next();
}

/* ROUTES */
router.route('/')
    .get(async (req, res) => {
        res.redirect('/directory');
    })
    .post(
        body('name').trim().notEmpty().escape(),
        body('description').optional().trim().escape().default(''),
        body('visible').optional().isBoolean(),
        body('show_in_dir').optional().isBoolean(),
        body('view_member_list').optional().isIn(['member', 'moderator', 'administrator', 'owner']),
        body('view_posts').optional().isIn(['member', 'moderator', 'administrator', 'owner']),
        body('create_posts').optional().isIn(['member', 'moderator', 'administrator', 'owner']),
        body('delete_posts').optional().isIn(['moderator', 'administrator', 'owner']),
        body('view_comments').optional().isIn(['member', 'moderator', 'administrator', 'owner']),
        body('create_comments').optional().isIn(['member', 'moderator', 'administrator', 'owner']),
        body('delete_comments').optional().isIn(['moderator', 'administrator', 'owner']),
        async (req, res) => {
            // creates a new space
            // TODO: handle validation errors
            console.log('body', req.body);
            const validationErrors = validationResult(req);

            const data = matchedData(req);
            data.creator_id = req.session.user.id;
            console.log('data:', data);

            const q = buildInsertQuery('spaces', data);
            console.log('query:', q);

            const result = await req.db.query(q);
            res.redirect('/directory');
        }
    );

router.route('/new')
    .get(async (req, res) => {
        res.render('space_editor');
    })

router.route('/:space_id')
    .get(async (req, res) => {
        const user_id = req.session.user.id;
        const space_id = req.params.space_id;

        // fetch space info to determine if space exists
        const sql = "SELECT * FROM get_space_info_with_user_context($1, $2);";
        const query = await req.db.query(sql, [user_id, space_id]);
        const data = {space: query.rows?.[0]};

        // if space doesn't exist OR is not visible to this particular user, send error
        if (data.space === undefined || !data.space.is_visible) {
            res.status(404).send("Not found");
            return;
        }

        // fetch member list
        if (data.space.can_view_member_list) {
            const sql = "SELECT m.user_id AS id, m.user_role AS role, u.display_name AS name FROM memberships m JOIN users u ON m.user_id=u.id WHERE m.space_id=$1 ORDER BY m.user_role DESC, u.display_name ASC;";
            const query = await req.db.query(sql, [space_id]);
            data.people = query.rows;
        }

        // fetch posts
        if (data.space.can_view_posts) {
            const sql = "SELECT p.*, u.display_name AS author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE space_id=$1 ORDER BY p.id DESC;";
            const query = await req.db.query(sql, [space_id]);
            data.posts = query.rows;
        }

        res.render('space', data);
    })
    .post(async (req, res) => {
        const user_id = req.session.user.id;
        const space_id = req.params.space_id;
        const post_text = req.body.post; // TODO: properly prep post text for storage

        if (!post_text) {
            // TODO: what do I do here?
            res.status(400).send("Cannot submit blank post");
            return;
        }

        // get permissions
        let sql = "SELECT id, can_create_posts FROM get_space_info_with_user_context($1, $2);";
        let query = await req.db.query(sql, [user_id, space_id]);
        const can_create_post = query.rows[0].can_create_posts ?? false;

        // TODO: add case for space doesn't exist

        if (!can_create_post) {
            res.status(403).send("User does not have post creation privileges in this space");
            return;
        }

        sql = "INSERT INTO posts(space_id, author_id, contents) VALUES ($1, $2, $3) RETURNING *;";
        query = await req.db.query(sql, [space_id, user_id, post_text]);
        //TODO: error handling

        res.redirect('back');
    });