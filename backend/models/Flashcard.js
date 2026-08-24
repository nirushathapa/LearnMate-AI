const mongoose = require('mongoose')

const flashcardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  question: { type: String, required: true },
  answer: { type: String, required: true },
}, { timestamps: true })

module.exports = mongoose.model('Flashcard', flashcardSchema)
