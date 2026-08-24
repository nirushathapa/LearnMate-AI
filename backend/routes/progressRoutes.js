const express = require('express')
const Progress = require('../models/Progress')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, async (req, res) => {
  const progress = await Progress.findOne({ user: req.user.id })
  res.json(progress || { notesUploaded: 0, quizzesCompleted: 0, studyHours: 0, progressPercentage: 0 })
})

module.exports = router
