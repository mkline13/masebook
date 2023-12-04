import express from 'express';

const router = express.Router();
export default router;

router.route('/')
    .get(async (req, res) => {
        // Displays a list of all users on the server
        const data = {};
        {
            const sql = "SELECT id, display_name, account_type FROM users WHERE account_status='active' AND show_in_dir=TRUE ORDER BY account_type DESC, display_name;";
            const query = await req.db.query(sql);
            data.users = query.rows;
        }
        {
            const sql = "SELECT * FROM list_server_spaces($1);";
            const query = await req.db.query(sql, [req.session.user.id]);
            data.spaces = query.rows;
        }
        res.render('directory', data);
    })