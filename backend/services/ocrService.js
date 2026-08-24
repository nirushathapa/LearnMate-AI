const { createWorker } = require('tesseract.js')

async function extractTextFromImage(buffer) {
  const worker = await createWorker('eng')
  try {
    const { data } = await worker.recognize(buffer)
    return data.text.replace(/\s+/g, ' ').trim()
  } finally {
    await worker.terminate()
  }
}

module.exports = { extractTextFromImage }
