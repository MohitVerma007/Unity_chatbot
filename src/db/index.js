const { Pool } = require('pg')
const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DBPORT,
});

pool.connect((err) => {
  if (err) throw err;
  console.log("Connect to PostgreSQL successfully!");
});


module.exports = {
  query: (text, params) => pool.query(text, params),
}
