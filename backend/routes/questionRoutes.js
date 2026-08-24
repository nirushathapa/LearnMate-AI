const express = require('express')
const { generateStudyQuestions, saveQuestionSet, listQuestionSets } = require('../controllers/questionController')

const router = express.Router()
router.post('/generate', generateStudyQuestions)
router.post('/save', saveQuestionSet)
router.get('/', listQuestionSets)

module.exports = router
