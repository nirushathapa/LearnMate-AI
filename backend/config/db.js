const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'learnmate_ai',
  waitForConnections: true,
  connectionLimit: 10,
})

let databaseConnected = false

async function connectDatabase() {
  const connection = await pool.getConnection()
  connection.release()
  databaseConnected = true
  console.log('MySQL connected')
}

function isDatabaseConnected() {
  return databaseConnected
}

module.exports = { pool, connectDatabase, isDatabaseConnected }
