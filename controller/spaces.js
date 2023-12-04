import express from 'express';

const router = express.Router();
export default router;


router.route('/')
    .get(async (req, res) => {
        res.redirect('/directory');
    })
    .post(async (req, res) => {
        // create a new space
        const sql = "SELECT create_space($1, $2, $3);";
        const values = [req.session.user.id, req.body.name, req.body.description];
        const query = await req.db.query(sql, values);
        res.json({new_space: query.rows});
    });

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