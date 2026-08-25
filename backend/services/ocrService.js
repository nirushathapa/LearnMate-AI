const { createWorker } = require('tesseract.js')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

function normalizeText(text) {
  return String(text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

async function extractTextFromImage(buffer) {
  const worker = await createWorker('eng')
  try {
    const { data } = await worker.recognize(buffer)
    return normalizeText(data.text)
  } finally {
    await worker.terminate()
  }
}

async function extractTextFromFile(file) {
  if (file.mimetype.startsWith('image/')) return extractTextFromImage(file.buffer)
  if (file.mimetype === 'application/pdf') return normalizeText((await pdfParse(file.buffer)).text)
  if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return normalizeText((await mammoth.extractRawText({ buffer: file.buffer })).value)
  }
  if (file.mimetype === 'text/plain') return normalizeText(file.buffer.toString('utf8'))
  throw new Error('Unsupported file type. Please upload an image, PDF, DOCX, or TXT file.')
}

module.exports = { extractTextFromImage, extractTextFromFile, normalizeText }
