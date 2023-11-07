


export default function(db) {
    const controller = async (req, res) => {
        const qres = await db.query("SELECT * FROM space_info WHERE id=$1;", [req.params.space_id]);
        res.locals.space = qres.rows[0];
        res.render('space');
    }

    return controller;
};