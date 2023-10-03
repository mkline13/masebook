import pg from 'pg';

export default class Database {
    constructor(dbParams) {
        this.pool = new pg.Pool(dbParams)
    }

    // call this to gracefully close the db when the program quits
    close() {
        this.pool.end()
    }

    // call this to execute a SINGLE query
    async query(text, params) {
        // logging code can be added here
        return await this.pool.query(text, params);
    }

    // call this to execute a series of queries with the same client from the pool
    async execute (func) {
        const client = await this.pool.connect();
        const res = await func(client);
        client.release();
        return res;
    }
}