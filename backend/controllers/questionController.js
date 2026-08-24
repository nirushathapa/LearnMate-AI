const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuestions } = require('../services/aiService')
const { extractTextFromImage } = require('../services/ocrService')

async function generateStudyQuestions(req, res) {
  try {
    const { notes = '', numberOfQuestions = 5, questionType = 'Mixed' } = req.body
    let material = notes.trim()
    if (req.file) material = await extractTextFromImage(req.file.buffer)
    if (!material) return res.status(422).json({ message: 'We could not read this image. Please upload a clearer image or paste your notes.' })

    const questions = await generateQuestions(material, Number(numberOfQuestions), questionType, { requireAI: Boolean(req.file) })
    res.json({ notes: material, numberOfQuestions: Number(numberOfQuestions), questionType, questions })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
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
