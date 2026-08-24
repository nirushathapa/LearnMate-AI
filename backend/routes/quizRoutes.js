const express = require('express')
const { generateQuizQuestions, saveQuiz, listQuizzes } = require('../controllers/quizController')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()
router.post('/generate', upload.single('image'), generateQuizQuestions)
router.post('/save', saveQuiz)
router.get('/', listQuizzes)

module.exports = router
