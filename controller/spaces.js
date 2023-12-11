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
        text: `INSERT INTO ${table} (${keys.join(',')}) VALUES (${params.join(',')}) RETURNING *;`,
        values: Object.values(obj)
    };
}

async function getSpaceInfo(req, res, next) {
    const user = res.locals.user;
    user.space = {};
    const space_id = req.params.space_id; //TODO: sanitize

    // get space info
    const query = {
        text:  `SELECT
                    s.*,
                    m.user_role,
                    m.show_in_profile AS in_user_profile
                FROM
                    spaces s
                    FULL OUTER JOIN memberships m ON m.space_id = s.id AND m.user_id=$2
                    WHERE s.id=$1;`,
        values: [space_id, user.id]
    }
    const result = await req.db.query(query);

    // Split result into proper container
    if (result.rows[0]) {
        const space = {};
        for (const [k, v] of Object.entries(result.rows[0])) {
            switch (k) {
                case 'in_user_profile':
                    user.space.in_profile = v;
                    break;
                case 'user_role':
                    user.space.role = v;
                    break;
                default:
                    space[k] = v;
            }
        }
    
        user.space.visible = space.visible || user.space.role !== null;
        user.space.show_in_dir = (space.visible && space.show_in_dir) || user.space.role !== null;
    
        res.locals.space = space;
    }

    next();
}

async function getSpacePermissions(req, res, next) {
    // Expects that getSpaceInfo has been run already
    const user = res.locals.user;
    if (!user.space.visible) {
        next();
        return;
    }

    const permissions = {};
    const default_permissions = {};
    const user_permissions = {};

    // get permissions
    {
        const query = {
            name: 'fetch-space-permissions',
            text:  `WITH actions AS (
                        SELECT
                            sa.action,
                            sa.default_role_required,
                            coalesce(sp.role_required, sa.default_role_required) as role_required
                        FROM
                            space_actions sa
                            LEFT JOIN space_permissions sp ON sp.action=sa.action AND sp.space_id=$1
                    )
                    SELECT
                        a.action,
                        a.default_role_required,
                        a.role_required,
                        m.user_role >= a.role_required as can_user_do
                    FROM
                        actions a
                        LEFT JOIN memberships m ON m.space_id=$1 AND m.user_id=$2`,
            values: [res.locals.space.id, req.session.user.id]
        }
        const result = await req.db.query(query);

        for (const row of result.rows) {
            permissions[row.action] = row.role_required;
        }
        for (const row of result.rows) {
            default_permissions[row.action] = row.default_role_required;
        }
        for (const row of result.rows) {
            user_permissions[row.action] = row.can_user_do;
        }
    }

    res.locals.space.permissions = permissions;
    res.locals.space.default_permissions = default_permissions;
    res.locals.user.space.permissions = user_permissions;

    next();
}

const roles = ['member', 'moderator', 'administrator', 'owner'];

// TODO: instead of lazy loading like this, load permissions at startup
let default_permissions_cache;
async function get_default_permissions(db) {
    if (default_permissions_cache === undefined) {
        const sql = "SELECT * FROM space_actions;"
        const result = await db.query(sql);
        default_permissions_cache = result.rows;
    }
    return default_permissions_cache;
}


/* ROUTES */
router.route('/')
    .get(async (req, res) => {
        res.redirect('/directory');
    })
    .post(
        body('settings').isObject(),
        body('permissions').isArray(),
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

            const settings_query = buildInsertQuery('spaces', data.settings);
            const permissions_query = "INSERT INTO space_permissions(space_id, action, role_required) VALUES ($1, $2, $3) RETURNING *;"
            // create new space
            await req.db.execute(async (db) => {
                const new_space_result = await db.query(settings_query);
                const new_space_id = new_space_result.rows[0].id;
                
                for (const [k,v] of data.permissions) {
                    const result = await db.query(permissions_query, [new_space_id, k, v]);
                }
            });

            res.redirect('/directory');
        }
    );


router.route('/new')
    .get(async (req, res) => {
        res.locals.space ||= {};
        res.locals.space.default_permissions = await get_default_permissions(req.db);
        res.render('space_editor');
    })

router.route('/:space_id')
    .get(getSpaceInfo, getSpacePermissions, async (req, res) => {
        const space = res.locals.space;
        const user = res.locals.user;

        // if space doesn't exist OR is not visible to this particular user, send error
        if (space === undefined || !user.space.visible) {
            res.status(404).send("Not found");
            return;
        }

        // fetch member list
        if (user.space.permissions.view_member_list) {
            const sql = "SELECT m.user_id AS id, m.user_role AS role, u.display_name AS name FROM memberships m JOIN users u ON m.user_id=u.id WHERE m.space_id=$1 ORDER BY m.user_role DESC, u.display_name ASC;";
            const result = await req.db.query(sql, [space.id]);
            res.locals.people = result.rows;
        }

        // fetch posts
        if (user.space.permissions.view_posts) {
            const sql = "SELECT p.*, u.display_name AS author_name FROM posts p JOIN users u ON p.author_id = u.id WHERE space_id=$1 ORDER BY p.id DESC;";
            const result = await req.db.query(sql, [space.id]);
            res.locals.posts = result.rows;
        }

        res.render('space');
    })
    .post(getSpaceInfo, getSpacePermissions, async (req, res) => {
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