

export async function get_spaces(req, res) {
    const result = {}
    const qres = await req.db.query("SELECT id, role, name FROM get_member_spaces($1);", [res.locals.user.id]);
    res.json(qres.rows);
}

export async function create_space(req, res)  {
    const user = res.locals.user;
    const text = "SELECT create_space($1, $2, $3);";
    const values = [user.id, req.body.name, req.body.description];
    const qres = await req.db.query(text, values);
    const result = {new_space: qres.rows};
    res.json(result);
}