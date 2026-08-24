const mongoose = require('mongoose')

async function connectDatabase() {
  const { MONGO_URI } = process.env

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing. Add your MongoDB connection string to backend/.env.')
  }

  await mongoose.connect(MONGO_URI)
  console.log('MongoDB connected')
}

module.exports = connectDatabase
