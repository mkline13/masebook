

export default function(db) {
    const controller = async (req, res) => {
        const result = {}
        const query_result = await db.query("SELECT id, name, description FROM spaces WHERE owner_id=$1;", [res.locals.user.id]);
        result.owner = query_result.rows;
        res.json(result);
    }

    return controller;
};