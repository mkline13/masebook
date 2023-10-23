import createApp from './app.js';
import Database from './model/db.js';
import { createServer } from 'http';

process.env.PORT = process.env.PORT ?? 10000;

// TODO: SSL STUFF ADD LATER
// const serverOptions = {
//     key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
//     cert: fs.readFileSync(path.join(__dirname, '../ssl/server.cert')),
// }
const serverOptions = {};

// Start server
const dbParams = {
    host: 'localhost',
    port: 5432,
    database: 'masebook',
    user: 'work',
    password: 'password',
};

const db = new Database(dbParams);
const app = createApp(db);
const server = createServer(serverOptions, app).listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}...`)
});