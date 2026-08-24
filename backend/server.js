require('dotenv').config()

const cors = require('cors')
const express = require('express')
const path = require('path')
const connectDatabase = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const noteRoutes = require('./routes/noteRoutes')
const quizRoutes = require('./routes/quizRoutes')
const flashcardRoutes = require('./routes/flashcardRoutes')
const studyPlanRoutes = require('./routes/studyPlanRoutes')
const progressRoutes = require('./routes/progressRoutes')

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/api/test', (req, res) => {
  res.json({ message: 'LearnMate AI backend is working!' })
})

app.use('/api/users', userRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/flashcards', flashcardRoutes)
app.use('/api/study-plans', studyPlanRoutes)
app.use('/api/progress', progressRoutes)

app.use((error, req, res, next) => {
  console.error(error.message)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
})

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing. Add a private secret to backend/.env.')
    }
    await connectDatabase()
    app.listen(port, () => {
      console.log(`LearnMate AI backend running on http://localhost:${port}`)
    })
  } catch (error) {
    console.error(`Backend startup failed: ${error.message}`)
    process.exitCode = 1
  }
}

startServer()

module.exports = app
