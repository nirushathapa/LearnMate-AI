const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuiz } = require('../services/aiService')
const { extractTextFromFile, normalizeText } = require('../services/ocrService')

async function generateQuizQuestions(req, res) {
  try {
    const { notes = '', numberOfQuestions = 5, difficulty = 'Medium' } = req.body
    if (!Number.isInteger(Number(numberOfQuestions)) || ![3, 5, 10].includes(Number(numberOfQuestions))) return res.status(400).json({ message: 'Choose 3, 5, or 10 questions.' })
    const text = normalizeText(notes)
    const extracted = []
    console.log('[UPLOAD] files received:', req.files?.length || 0)
    for (const file of req.files || []) console.log('[FILE SELECTED]', { filename: file.originalname, type: file.mimetype, size: file.size })
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
    console.log('[EXTRACTED CONTENT]', { length: extracted.join('\n').length, preview: extracted.join('\n').slice(0, 300) })
    console.log('[QUIZ INPUT]', { textLength: text.length, fileContentLength: extracted.join('\n').length, totalMaterialLength: material.length })
    console.log(`[INPUT TYPE] ${req.files?.map((file) => file.mimetype).join(', ') || 'text'}`)
    console.log(`[EXTRACTED CONTENT LENGTH] ${extracted.join('\n').length}`)
    console.log(`[EXTRACTED CONTENT PREVIEW] ${extracted.join('\n').slice(0, 1000)}`)
    if (material.replace(/\[.*?\]/g, '').trim().length < 20) return res.status(422).json({ message: 'Could not read enough content from this file/image. Please upload a clearer image or readable document.' })

    const questions = await generateQuiz(material, Number(numberOfQuestions), difficulty)
    console.log(`[GENERATED QUESTION COUNT] ${questions.length}`)
    res.json({ notes: material, extractedContent: material, numberOfQuestions: Number(numberOfQuestions), difficulty, questions })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

async function saveQuiz(req, res) {
  try {
    if (!isDatabaseConnected()) return res.status(503).json({ message: 'MySQL is not connected. Quiz was not saved.' })
    const { id, notes, numberOfQuestions, difficulty = 'Medium', questions, score = null } = req.body

    if (id) {
      if (score === null || !Number.isInteger(Number(score))) return res.status(400).json({ message: 'A score is required to update a quiz.' })
      const [result] = await pool.execute('UPDATE quizzes SET score = ? WHERE id = ?', [Number(score), Number(id)])
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Quiz was not found.' })
      return res.json({ id: Number(id), message: 'Quiz score updated successfully.' })
    }

    if (!notes || !Number.isInteger(Number(numberOfQuestions)) || !Array.isArray(questions) || questions.length === 0) return res.status(400).json({ message: 'Notes, number of questions, and questions are required.' })

    const [result] = await pool.execute(
      'INSERT INTO quizzes (notes, number_of_questions, difficulty, questions, score, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
      [notes, Number(numberOfQuestions), difficulty, JSON.stringify(questions), score, questions.length],
    )
    res.status(201).json({ id: result.insertId, message: 'Quiz saved successfully.' })
  } catch (error) {
    console.error('[QUIZ SAVE ERROR]', error.message)
    res.status(500).json({ message: 'Quiz could not be saved. Please check the MySQL database.' })
  }
}

async function listQuizzes(req, res) {
  if (!isDatabaseConnected()) return res.json([])
  const [rows] = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC')
  res.json(rows.map((quiz) => ({ ...quiz, questions: typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions })))
}

module.exports = { generateQuizQuestions, saveQuiz, listQuizzes }
