const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  overallPercentage: { type: Number, default: 0 },
  studyHours: { type: Number, default: 0 },
  completedTopics: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Progress', progressSchema)
