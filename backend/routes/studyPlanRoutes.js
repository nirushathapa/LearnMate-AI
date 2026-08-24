const express = require('express')
const StudyPlan = require('../models/StudyPlan')
const protect = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/', protect, async (req, res) => res.json(await StudyPlan.find({ user: req.user.id }).sort({ date: 1 })))
router.post('/', protect, async (req, res) => res.status(201).json(await StudyPlan.create({ ...req.body, user: req.user.id })))
router.put('/:id', protect, async (req, res) => res.json(await StudyPlan.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true })))
router.delete('/:id', protect, async (req, res) => {
  await StudyPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  res.json({ message: 'Study task deleted successfully.' })
})

module.exports = router
