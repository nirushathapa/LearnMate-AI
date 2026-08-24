const express = require('express')
const Flashcard = require('../models/Flashcard')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, async (req, res) => {
  res.json(await Flashcard.find({ user: req.user.id }).sort({ createdAt: -1 }))
})

module.exports = router
