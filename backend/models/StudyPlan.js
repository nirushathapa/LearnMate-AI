const mongoose = require('mongoose')

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: String,
  topic: { type: String, required: true },
  scheduledAt: Date,
  date: String,
  time: String,
  completed: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('StudyPlan', studyPlanSchema)
