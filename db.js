const pg = require('pg');

const pool = new pg.Pool({
    host: 'localhost',
    port: 5432,
    database: 'masebook',
    user: 'work',
    password: 'password',
});

// call this to gracefully close the db when the program quits
const close = () => pool.end();

const query = async (text, params) => {
    // logging code can be added here
    return await pool.query(text, params);
}

// ensures that all code in the callback function is executed with the same client from the pool
const execute = async (func) => {
    const client = await pool.connect();
    const res = await func(client);
    client.release();
    return res;
}

module.exports = { query, execute, close };