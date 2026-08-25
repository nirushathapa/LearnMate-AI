const express = require('express')
const { generateQuizQuestions, saveQuiz, listQuizzes } = require('../controllers/quizController')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()
router.post('/generate', upload.array('files', 5), generateQuizQuestions)
router.post('/save', saveQuiz)
router.get('/', listQuizzes)

module.exports = router
