const multer = require('multer')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) return callback(null, true)
    callback(new Error('Only image files are supported for OCR.'))
  },
})

module.exports = upload
