const multer = require('multer')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const supported = file.mimetype.startsWith('image/') || [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ].includes(file.mimetype)
    if (supported) return callback(null, true)
    callback(new Error('Unsupported file type. Please upload an image, PDF, DOCX, or TXT file.'))
  },
})

module.exports = upload
