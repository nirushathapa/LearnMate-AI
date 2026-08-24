const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  subject: String,
  fileName: String,
  filePath: String,
  fileType: String,
}, { timestamps: true })

module.exports = mongoose.model('Note', noteSchema)
