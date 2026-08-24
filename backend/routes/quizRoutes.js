const express = require('express')
const { generateQuizQuestions, saveQuiz, listQuizzes } = require('../controllers/quizController')

const router = express.Router()
router.post('/generate', generateQuizQuestions)
router.post('/save', saveQuiz)
router.get('/', listQuizzes)

module.exports = router
