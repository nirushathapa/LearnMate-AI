const MAX_SOURCE_LENGTH = 30000
const stopWords = new Set('a an and are as at be by for from how in is it of on or that the their these this to was what when which with'.split(' '))

function sourceTokens(text) {
  return new Set((text.toLowerCase().match(/[a-z0-9]{3,}/g) || []).map(normalizeToken).filter((token) => !stopWords.has(token)))
}

function normalizeToken(token) {
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`
  if (token.endsWith('es') && token.length > 4) return token.slice(0, -2)
  if (token.endsWith('s') && token.length > 3) return token.slice(0, -1)
  return token
}

function isGrounded(text, source, minimumOverlap = 1, minimumRatio = 0.45) {
  const tokens = (text.toLowerCase().match(/[a-z0-9]{3,}/g) || []).map(normalizeToken).filter((token) => !stopWords.has(token))
  if (!tokens.length) return false
  const available = sourceTokens(source)
  const overlap = tokens.filter((token) => available.has(token)).length
  return overlap >= minimumOverlap && overlap / tokens.length >= minimumRatio
}

function validateQuizQuestions(questions, source) {
  return (Array.isArray(questions) ? questions : []).filter((item) => {
    if (!item || typeof item.question !== 'string' || !Array.isArray(item.options) || item.options.length !== 4 || typeof item.correctAnswer !== 'string' || typeof item.explanation !== 'string') return false
    const options = item.options.map((option) => option.trim().toLowerCase())
    const correctAnswer = item.correctAnswer.trim().toLowerCase()
    return new Set(options).size === 4 && isGrounded(item.question, source) && item.options.every((option) => typeof option === 'string' && isGrounded(option, source, 1, 0.2)) && options.includes(correctAnswer) && isGrounded(item.correctAnswer, source, 1, 0.2) && isGrounded(item.explanation, source, 1, 0.2)
  })
}

function validateStudyQuestions(questions, source) {
  return (Array.isArray(questions) ? questions : []).filter((item) => item && typeof item.question === 'string' && isGrounded(item.question, source))
}

async function requestAI(prompt) {
  if (!process.env.GEMINI_API_KEY) throw new Error('Question generation failed. Add a valid GEMINI_API_KEY to backend/.env and try again.')

  const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'You are a study-question generator. The source material in the user message is the only authoritative knowledge source. Never use general knowledge, infer missing facts, or invent information.' }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 4096 },
    }),
  })
  if (!response.ok) {
    if (response.status === 400 || response.status === 401 || response.status === 403) throw new Error('Gemini rejected the API key or request. Check GEMINI_API_KEY and the enabled Gemini API.')
    if (response.status === 404) throw new Error(`Gemini model "${model}" is unavailable. Update GEMINI_MODEL in backend/.env.`)
    if (response.status === 429) throw new Error('Gemini free-tier rate limit reached. Please wait and try again.')
    throw new Error('AI request failed.')
  }
  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('')
  if (!text) throw new Error('Gemini returned no question data.')
  return JSON.parse(text)
}

async function generateQuiz(notes, numberOfQuestions, difficulty, options = {}) {
  if (notes.length > MAX_SOURCE_LENGTH) throw new Error('Study material is too large. Please upload a smaller document or split it into sections.')
  const source = notes.slice(0, MAX_SOURCE_LENGTH)
  console.log(`[AI SOURCE LENGTH] ${source.length}`)
  const prompt = `Generate exactly ${numberOfQuestions} ${difficulty} multiple-choice study questions. Return JSON with a questions array containing exactly ${numberOfQuestions} items. Each item must contain question, options (exactly four strings), correctAnswer, and a short explanation. Every option, answer, and explanation must be directly supported by the source. Do not repeat questions or options.\n\nSOURCE MATERIAL:\n${source}`
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const data = await requestAI(attempt ? `${prompt}\n\nYour previous response did not contain enough valid items. Return ${numberOfQuestions} complete, distinct items now. Keep every option and explanation directly supported by the source.` : prompt)
    const questions = validateQuizQuestions(data?.questions, source).slice(0, numberOfQuestions).map((question) => ({ ...question, difficulty }))
    if (questions.length === numberOfQuestions) return questions
  }
  throw new Error(`Gemini could not produce exactly ${numberOfQuestions} source-grounded quiz questions. Try a smaller number or provide more study material.`)
}

async function generateQuestions(notes, numberOfQuestions, questionType, options = {}) {
  if (notes.length > MAX_SOURCE_LENGTH) throw new Error('Study material is too large. Please upload a smaller document or split it into sections.')
  const source = notes.slice(0, MAX_SOURCE_LENGTH)
  console.log(`[AI SOURCE LENGTH] ${source.length}`)
  const prompt = `Generate exactly ${numberOfQuestions} ${questionType} study questions. Return JSON with a questions array containing exactly ${numberOfQuestions} items. Each item must contain only question. Every question must be directly answerable from explicit information in the source. Do not repeat questions.\n\nSOURCE MATERIAL:\n${source}`
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const data = await requestAI(attempt ? `${prompt}\n\nYour previous response did not contain enough valid items. Return ${numberOfQuestions} complete, distinct questions now.` : prompt)
    const questions = validateStudyQuestions(data?.questions, source).slice(0, numberOfQuestions)
    if (questions.length === numberOfQuestions) return questions
  }
  throw new Error(`Gemini could not produce exactly ${numberOfQuestions} source-grounded questions. Try a smaller number or provide more study material.`)
}

module.exports = { generateQuiz, generateQuestions }
