const express = require('express')
const Quiz = require('../models/Quiz')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, async (req, res) => res.json(await Quiz.find({ user: req.user.id }).sort({ createdAt: -1 })))
router.post('/', protect, async (req, res) => {
  const quiz = await Quiz.create({ ...req.body, user: req.user.id })
  res.status(201).json(quiz)
})

module.exports = router
