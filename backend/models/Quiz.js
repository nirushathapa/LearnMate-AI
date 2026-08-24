const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: String,
  questions: [{ question: String, options: [String], answer: String }],
  score: Number,
}, { timestamps: true })

module.exports = mongoose.model('Quiz', quizSchema)
