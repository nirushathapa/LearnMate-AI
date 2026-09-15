const { pool, isDatabaseConnected } = require('../config/db')
const { generateQuiz } = require('../services/aiService')
const { extractTextFromFile, normalizeText } = require('../services/ocrService')

async function generateQuizQuestions(req, res) {
  try {
    // Get values from the request
    const notes = normalizeText(req.body?.notes || '')
    const numberOfQuestions = Number(req.body?.numberOfQuestions || 5)
    const difficulty = req.body?.difficulty || 'Medium'

    console.log('--- QUIZ GENERATION REQUEST ---')
    console.log('Notes length:', notes.length)
    console.log('Number of questions:', numberOfQuestions)
    console.log('Difficulty:', difficulty)
    console.log('Files:', req.files?.length || 0)

    // Validate question count
    if (![3, 5, 10].includes(numberOfQuestions)) {
      return res.status(400).json({
        message: 'Choose 3, 5, or 10 questions.',
      })
    }

    // Store extracted file content
    const extracted = []

    // Read uploaded files if any
    if (req.files && req.files.length > 0) {
      try {
        for (const file of req.files) {
          console.log(`Reading file: ${file.originalname}`)

          const content = await extractTextFromFile(file)

          if (content && content.trim().length > 0) {
            extracted.push(
              `[${file.originalname}]\n${content.trim()}`
            )
          }
        }
      } catch (error) {
        console.error('File extraction error:', error.message)

        return res.status(422).json({
          message:
            'Unable to read the uploaded file. Please upload a clear image, readable PDF, DOCX, or TXT file.',
        })
      }
    }

    // Combine text input and extracted file content
    const parts = []

    if (notes.length > 0) {
      parts.push(`USER TEXT:\n${notes}`)
    }

    if (extracted.length > 0) {
      parts.push(
        `EXTRACTED FILE CONTENT:\n${extracted.join('\n\n')}`
      )
    }

    const material = parts.join('\n\n').trim()

    console.log('Final material length:', material.length)

    // Make sure there is enough content
    if (material.length < 20) {
      return res.status(422).json({
        message:
          'Please provide at least 20 characters of study notes or upload a readable file.',
      })
    }

    console.log('Sending material to local AI...')

    // Generate questions using LM Studio
    const questions = await generateQuiz(
      material,
      numberOfQuestions,
      difficulty
    )

    console.log(
      'Generated question count:',
      questions?.length || 0
    )

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(503).json({
        message:
          'The AI could not generate questions. Please try again.',
      })
    }

    return res.json({
      notes: material,
      extractedContent: material,
      numberOfQuestions,
      difficulty,
      questions,
    })
  } catch (error) {
    console.error('Quiz generation error:', error)

    return res.status(503).json({
      message:
        error.message || 'Quiz generation failed. Please try again.',
    })
  }
}

async function saveQuiz(req, res) {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        message: 'MySQL is not connected. Quiz was not saved.',
      })
    }

    const {
      notes,
      difficulty = 'medium',
      questions,
      score = null,
    } = req.body

    if (
      !notes ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res.status(400).json({
        message: 'Notes and questions are required.',
      })
    }

    const [result] = await pool.execute(
      `INSERT INTO quizzes
       (notes, difficulty, questions, score, total_questions)
       VALUES (?, ?, ?, ?, ?)`,
      [
        notes,
        difficulty,
        JSON.stringify(questions),
        score,
        questions.length,
      ]
    )

    return res.status(201).json({
      id: result.insertId,
      message: 'Quiz saved successfully.',
    })
  } catch (error) {
    console.error('Save quiz error:', error)

    return res.status(500).json({
      message: error.message || 'Unable to save quiz.',
    })
  }
}

async function listQuizzes(req, res) {
  try {
    if (!isDatabaseConnected()) {
      return res.json([])
    }

    const [rows] = await pool.query(
      'SELECT * FROM quizzes ORDER BY created_at DESC'
    )

    const quizzes = rows.map((quiz) => ({
      ...quiz,
      questions:
        typeof quiz.questions === 'string'
          ? JSON.parse(quiz.questions)
          : quiz.questions,
    }))

    return res.json(quizzes)
  } catch (error) {
    console.error('List quizzes error:', error)

    return res.status(500).json({
      message: error.message || 'Unable to load quizzes.',
    })
  }
}

module.exports = {
  generateQuizQuestions,
  saveQuiz,
  listQuizzes,
}