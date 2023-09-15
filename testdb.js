const db = require('./db');

console.log("HELLO WORLD");


// db.query("CREATE TABLE IF NOT EXISTS users ( \
//                 id SERIAL PRIMARY KEY, \
//                 email VARCHAR UNIQUE NOT NULL \
//                 );")

db.query("INSERT INTO users(email) VALUES ('borby@gmail.com');");
db.query("INSERT INTO users(email) VALUES ('mason@mason.mason');");

// db.query("SELECT CURRENT_DATE").then((res) => { console.log("date: ", res.rows[0].current_date) },
//                                      (err) => { console.log(err) }
// );

db.close();