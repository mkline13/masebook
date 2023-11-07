

export default async function get_users(req, res) {
    const query_result = await req.db.query("SELECT id, display_name FROM users WHERE account_status='active' AND show_in_dir=TRUE;");
    res.json(query_result.rows);
}