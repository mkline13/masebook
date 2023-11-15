import bcrypt from 'bcryptjs';

export async function get_users(req, res) {
    const query_result = await req.db.query("SELECT id, display_name FROM users WHERE account_status='active' AND show_in_dir=TRUE;");
    res.json(query_result.rows);
}

const saltRounds = 10;
export async function create_user(req, res) {
    // check that user is allowed to do this action
    const user = req.session.user;
    if (user.account_type != 'administrator') {
        res.status(401).send("User is not authorized to create other users");
        return;
    }

    // TODO: validate / prep these fields for storage
    const email = req.body.email;
    const password = req.body.password;
    const display_name = req.body.display_name;
    const show_in_dir = req.body.show_in_dir ?? false;

    const hashed_password = await bcrypt.hash(password, saltRounds);

    const sql = "INSERT INTO users(email, hashed_password, display_name, show_in_dir) VALUES($1, $2, $3, $4) RETURNING id, email, display_name, show_in_dir;";
    const values = [email, hashed_password, display_name, show_in_dir];
    const qres = await req.db.query(sql, values);
    res.json(qres.rows[0]);
}