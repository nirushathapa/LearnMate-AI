const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuestions } = require('../services/aiService')
const { extractTextFromFile, normalizeText } = require('../services/ocrService')

async function generateStudyQuestions(req, res) {
  try {
    const { notes = '', numberOfQuestions = 5, questionType = 'Mixed' } = req.body
    if (!Number.isInteger(Number(numberOfQuestions)) || ![3, 5, 10].includes(Number(numberOfQuestions))) return res.status(400).json({ message: 'Choose 3, 5, or 10 questions.' })
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

    const questions = await generateQuestions(material, Number(numberOfQuestions), questionType)
    console.log(`[GENERATED QUESTION COUNT] ${questions.length}`)
    res.json({ notes: material, extractedContent: material, numberOfQuestions: Number(numberOfQuestions), questionType, questions })
  } catch (error) {
    res.status(503).json({ message: error.message })
  }
}

async function saveQuestionSet(req, res) {
  try {
    if (!isDatabaseConnected()) return res.status(503).json({ message: 'MySQL is not connected. Question set was not saved.' })
    const { notes, numberOfQuestions, difficulty = null, questions } = req.body
    if (!notes || !Number.isInteger(Number(numberOfQuestions)) || !Array.isArray(questions) || questions.length === 0) return res.status(400).json({ message: 'Notes, number of questions, and questions are required.' })

    const [result] = await pool.execute(
      'INSERT INTO question_sets (notes, number_of_questions, difficulty, questions) VALUES (?, ?, ?, ?)',
      [notes, Number(numberOfQuestions), difficulty, JSON.stringify(questions)],
    )
    res.status(201).json({ id: result.insertId, message: 'Question set saved successfully.' })
  } catch (error) {
    console.error('[QUESTION SET SAVE ERROR]', error.message)
    res.status(500).json({ message: 'Question set could not be saved. Please check the MySQL database.' })
  }
}

async function listQuestionSets(req, res) {
  if (!isDatabaseConnected()) return res.json([])
  const [rows] = await pool.query('SELECT * FROM question_sets ORDER BY created_at DESC')
  res.json(rows.map((set) => ({ ...set, questions: typeof set.questions === 'string' ? JSON.parse(set.questions) : set.questions })))
}

module.exports = { generateStudyQuestions, saveQuestionSet, listQuestionSets }
