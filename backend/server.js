require('dotenv').config()

const cors = require('cors')
const express = require('express')
const { connectDatabase } = require('./config/db')
const quizRoutes = require('./routes/quizRoutes')
const questionRoutes = require('./routes/questionRoutes')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.get('/api/test', (req, res) => {
  res.json({ message: 'LearnMate AI backend is working!' })
})

app.use('/api/quizzes', quizRoutes)
app.use('/api/quiz', quizRoutes)
app.use('/api/questions', questionRoutes)

app.use((error, req, res, next) => {
  console.error(error.message)
  res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 500).json({ message: error.message || 'Something went wrong. Please try again.' })
})

async function startServer() {
  try {
    await connectDatabase()
  } catch (error) {
    console.warn(`MySQL is unavailable: ${error.message}`)
    console.warn('Starting in mock mode. Generation works; saving requires MySQL.')
  }
  app.listen(port, () => console.log(`LearnMate AI backend running on http://localhost:${port}`))
}

startServer()

module.exports = app
