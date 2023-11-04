

export default function(db) {
    const controller = async (req, res) => {
        const query_result = await db.query("SELECT id, display_name FROM users WHERE account_status='active' AND show_in_dir=TRUE;");
        res.json(query_result.rows);
    }

    return controller;
};