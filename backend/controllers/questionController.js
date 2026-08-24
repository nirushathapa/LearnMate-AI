const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuestions } = require('../services/aiService')

async function generateStudyQuestions(req, res) {
  const { notes, numberOfQuestions = 5, questionType = 'Mixed' } = req.body
  if (!notes || !notes.trim()) return res.status(400).json({ message: 'Notes are required.' })

  const questions = await generateQuestions(notes, Number(numberOfQuestions), questionType)
  res.json({ notes, numberOfQuestions: Number(numberOfQuestions), questionType, questions })
}

async function saveQuestionSet(req, res) {
  if (!isDatabaseConnected()) return res.status(503).json({ message: 'MySQL is not connected. Question set was not saved.' })
  const { notes, numberOfQuestions, questionType, questions } = req.body
  if (!notes || !questions) return res.status(400).json({ message: 'Notes and questions are required.' })

  const [result] = await pool.execute(
    'INSERT INTO question_sets (notes, number_of_questions, question_type, questions) VALUES (?, ?, ?, ?)',
    [notes, Number(numberOfQuestions), questionType, JSON.stringify(questions)],
  )
  res.status(201).json({ id: result.insertId, message: 'Question set saved successfully.' })
}

async function listQuestionSets(req, res) {
  if (!isDatabaseConnected()) return res.json([])
  const [rows] = await pool.query('SELECT * FROM question_sets ORDER BY created_at DESC')
  res.json(rows.map((set) => ({ ...set, questions: JSON.parse(set.questions) })))
}

module.exports = { generateStudyQuestions, saveQuestionSet, listQuestionSets }
