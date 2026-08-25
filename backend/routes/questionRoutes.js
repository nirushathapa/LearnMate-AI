const express = require('express')
const { generateStudyQuestions, saveQuestionSet, listQuestionSets } = require('../controllers/questionController')
const upload = require('../middleware/uploadMiddleware')

const router = express.Router()
router.post('/generate', upload.array('files', 5), generateStudyQuestions)
router.post('/save', saveQuestionSet)
router.get('/', listQuestionSets)

module.exports = router
