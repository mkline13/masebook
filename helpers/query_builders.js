function buildParamList(end) {
    const list = [];
    for (let i=1; i<=end; i++) {
        list.push('$' + i);
    }
    return list;
}

function buildInsertQuery(table, obj) {
    // NOTE: this function is not secure. Use data validation before building the query.
    const keys = Object.keys(obj);
    const params = buildParamList(keys.length);
    return {
        text: `INSERT INTO ${table} (${keys.join(',')}) VALUES (${params.join(',')}) RETURNING *;`,
        values: Object.values(obj)
    };
}