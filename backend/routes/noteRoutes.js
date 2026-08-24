const express = require('express')
const path = require('path')
const multer = require('multer')
const Note = require('../models/Note')
const protect = require('../middleware/authMiddleware')

const router = express.Router()
const upload = multer({
  dest: path.join(__dirname, '../uploads'),
  fileFilter: (req, file, callback) => {
    const allowedTypes = ['.pdf', '.docx', '.txt']
    const extension = path.extname(file.originalname).toLowerCase()
    callback(null, allowedTypes.includes(extension))
  },
})

router.get('/', protect, async (req, res) => {
  const userNotes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 })
  res.json(userNotes)
})

router.post('/upload', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Please select a file.' })
  const note = await Note.create({ user: req.user.id, title: req.body.title || req.file.originalname, subject: req.body.subject || 'General', fileName: req.file.originalname, filePath: req.file.path, fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase() })
  res.status(201).json(note)
})

router.delete('/:id', protect, async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id })
  if (!note) return res.status(404).json({ message: 'Note not found.' })
  res.json({ message: 'Note deleted successfully.' })
})

module.exports = router
