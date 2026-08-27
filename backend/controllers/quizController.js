const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuiz } = require('../services/aiService')
const { extractTextFromFile, normalizeText } = require('../services/ocrService')

async function generateQuizQuestions(req, res) {
  try {
    const { notes = '', numberOfQuestions = 5, difficulty = 'Medium' } = req.body
    const text = normalizeText(notes)
    const extracted = []
    try {
      for (const file of req.files || []) {
        const content = await extractTextFromFile(file)
        if (content) extracted.push(`[${file.originalname}]\n${content}`)
      }
    } catch (error) {
      if ((req.files || []).some((file) => file.mimetype.startsWith('image/'))) throw new Error('Unable to read the image. Please upload a clearer image.')
      throw new Error('Unable to extract readable content from this file.')
    }
    const material = [text && `USER TEXT:\n${text}`, ...extracted.map((content) => `EXTRACTED FILE CONTENT:\n${content}`)].filter(Boolean).join('\n\n')
    console.log(`[INPUT TYPE] ${req.files?.map((file) => file.mimetype).join(', ') || 'text'}`)
    console.log(`[EXTRACTED CONTENT LENGTH] ${extracted.join('\n').length}`)
    console.log(`[EXTRACTED CONTENT PREVIEW] ${extracted.join('\n').slice(0, 1000)}`)
    if (material.replace(/\[.*?\]/g, '').trim().length < 20) return res.status(422).json({ message: 'Could not read enough content from this file/image. Please upload a clearer image or readable document.' })

    const questions = await generateQuiz(material, Number(numberOfQuestions), difficulty)
    console.log(`[GENERATED QUESTION COUNT] ${questions.length}`)
    res.json({ notes: material, extractedContent: material, numberOfQuestions: Number(numberOfQuestions), difficulty, questions })
  } catch (error) {
    if (error.code === 'GEMINI_RATE_LIMIT' && error.retryAfter) res.set('Retry-After', String(error.retryAfter))
    res.status(error.code === 'GEMINI_RATE_LIMIT' ? 429 : 503).json({ message: error.message })
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
  res.json(rows.map((quiz) => ({ ...quiz, questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions })))
}

module.exports = { generateQuizQuestions, saveQuiz, listQuizzes }
