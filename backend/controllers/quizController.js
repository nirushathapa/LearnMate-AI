const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuiz } = require('../services/aiService')
const { extractTextFromImage } = require('../services/ocrService')

async function generateQuizQuestions(req, res) {
  try {
    const { notes = '', numberOfQuestions = 5, difficulty = 'Medium' } = req.body
    let material = notes.trim()
    if (req.file) material = await extractTextFromImage(req.file.buffer)
    if (!material) return res.status(422).json({ message: 'We could not read this image. Please upload a clearer image or paste your notes.' })

    const questions = await generateQuiz(material, Number(numberOfQuestions), difficulty, { requireAI: Boolean(req.file) })
    res.json({ notes: material, numberOfQuestions: Number(numberOfQuestions), difficulty, questions })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

async function saveQuiz(req, res) {
  if (!isDatabaseConnected()) return res.status(503).json({ message: 'MySQL is not connected. Quiz was not saved.' })
  const { notes, numberOfQuestions, difficulty, questions, score = null } = req.body
  if (!notes || !questions) return res.status(400).json({ message: 'Notes and questions are required.' })

  const [result] = await pool.execute(
    'INSERT INTO quizzes (notes, number_of_questions, difficulty, questions, score) VALUES (?, ?, ?, ?, ?)',
    [notes, Number(numberOfQuestions), difficulty, JSON.stringify(questions), score],
  )
  res.status(201).json({ id: result.insertId, message: 'Quiz saved successfully.' })
}

async function listQuizzes(req, res) {
  if (!isDatabaseConnected()) return res.json([])
  const [rows] = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC')
  res.json(rows.map((quiz) => ({ ...quiz, questions: JSON.parse(quiz.questions) })))
}

module.exports = { generateQuizQuestions, saveQuiz, listQuizzes }
