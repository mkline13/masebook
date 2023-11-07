


export default async function space_page_controller(req, res) {
    const qres = await req.db.query("SELECT * FROM space_info WHERE id=$1;", [req.params.space_id]);
    res.locals.space = qres.rows[0];
    res.render('space');
}