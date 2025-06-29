import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.MY_SQL_HOST,
  user: process.env.MY_SQL_USER,
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE,
  port: process.env.MY_SQL_PORT,
  multipleStatements: true
});

connection.connect((err) => {
  if (err) console.error('MySQL error:', err);
  else console.log('✅ Connected to MySQL');
});

export default connection;
