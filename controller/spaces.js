import express from 'express';

const router = express.Router();
export default router;

router.route('/')
    .get(async (req, res) => {
        // show a list of spaces associated with the user
        const sql = "SELECT id, role, name FROM get_member_spaces($1);";
        const query = await req.db.query(sql, [req.session.user.id]);
        
        // sort user into appropriate list based on the user's role
        const data = {
            spaces: {
                owner: [],
                administrator: [],
                moderator: [],
                member: [],
                follower: []
            }
        };

        for (let u of query.rows) {
            switch (u.role) {
                case 'owner':
                    data.spaces.owner.push(u);
                    break;
                case 'administrator':
                    data.spaces.administrator.push(u);
                    break;
                case 'moderator':
                    data.spaces.moderator.push(u);
                    break;
                case 'member':
                    data.spaces.member.push(u);
                    break;
            }
        }

        res.render('user_spaces', data);
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
        // shows the page for the specified space including space info and posts
        const data = {};
        {
            const query = await req.db.query("SELECT * FROM space_info WHERE id=$1;", [req.params.space_id]);
            data.space = query.rows[0];
        }
        {
            const sql = "SELECT user_id AS id, user_to_name(user_id) AS name, user_role FROM memberships WHERE space_id=$1 ORDER BY user_role DESC, name ASC;";
            const query = await req.db.query(sql, [req.params.space_id]);
            data.people = query.rows;
        }
        {
            const sql = "SELECT p.id, p.author_id, u.display_name AS author_name, p.creation_date, p.contents FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE space_id=$1 ORDER BY p.id DESC;";
            const query = await req.db.query(sql, [req.params.space_id]);
            data.posts = query.rows;
        }
        res.render('space', data);
    })
    .post((req, res) => {
        // creates a new post on the space
        res.send('not implemented');
    });