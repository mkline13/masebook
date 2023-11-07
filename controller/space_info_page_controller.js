
export default function(db) {
    const controller = async (req, res) => {
        let qres = await db.query("SELECT * FROM space_info WHERE id=$1;", [req.params.space_id]);
        res.locals.space = qres.rows[0];

        qres = await db.query("SELECT user_id AS id, user_to_name(user_id) AS name, role FROM memberships WHERE space_id=$1;", [req.params.space_id])
        res.locals.people = qres.rows;
        
        res.render('space_info');
    }

    return controller;
};