const MAX_SOURCE_LENGTH = 30000
const REQUEST_TIMEOUT_MS = 30000
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
    if (!item || typeof item.question !== 'string' || !Array.isArray(item.options) || item.options.length !== 4 || typeof item.correctAnswer !== 'string') return false
    const options = item.options.map((option) => option.trim())
    const correctAnswer = item.correctAnswer.trim().toLowerCase()
    if (new Set(options.map((option) => option.toLowerCase())).size !== 4 || options.some((option) => !option)) return false
    if (!isGrounded(item.question, source, 1, 0.15) || !isGrounded(item.correctAnswer, source, 1, 0.1)) return false
    if (!options.some((option) => option.toLowerCase() === correctAnswer)) {
      const replacementIndex = options.findIndex((option) => !isGrounded(option, source, 1, 0.2))
      options[replacementIndex >= 0 ? replacementIndex : 0] = item.correctAnswer.trim()
    }
    if (new Set(options.map((option) => option.toLowerCase())).size !== 4 || !options.some((option) => option.toLowerCase() === correctAnswer)) return false
    item.options = options
    item.explanation = typeof item.explanation === 'string' ? item.explanation : ''
    return true
  })
}

function parseAIJson(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error('LM Studio returned invalid question data. Please try again.')
  }
}

function validateStudyQuestions(questions, source) {
  return (Array.isArray(questions) ? questions : []).filter((item) => item && typeof item.question === 'string' && isGrounded(item.question, source, 1, 0.3))
}

async function requestAI(prompt, responseFormat, maxTokens) {
  const baseUrl = (process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234/v1').replace(/\/$/, '')
  const model = process.env.LM_STUDIO_MODEL || 'lfm2.5-1.2b-instruct'
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: responseFormat,
        messages: [
          { role: 'system', content: 'You are an AI educational assistant for LearnMate AI. Generate questions strictly from the provided study material. Do not introduce information that is not present in the study material unless absolutely necessary. Return only valid JSON in the requested structure.' },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    })
    if (!response.ok) {
      if (response.status === 404) throw new Error(`LM Studio model or endpoint is unavailable. Check LM_STUDIO_MODEL (${model}) and LM_STUDIO_BASE_URL.`)
      throw new Error(`LM Studio returned HTTP ${response.status}. Check that the local server is running.`)
    }
    const completion = await response.json()
    const text = completion.choices?.[0]?.message?.content
    if (!text) throw new Error('LM Studio returned no question data.')
    return parseAIJson(text)
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('LM Studio took too long to respond. Please try again.')
    const message = String(error.message || '')
    if (message.startsWith('LM Studio')) throw error
    throw new Error('Unable to connect to LM Studio. Start the local server at http://localhost:1234/v1 and try again.')
  } finally {
    clearTimeout(timeout)
  }
}

function responseFormatFor(count, quiz) {
  const properties = quiz
    ? {
        question: { type: 'string' },
        options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
        correctAnswer: { type: 'string' },
      }
    : { question: { type: 'string' } }
  const required = quiz ? ['question', 'options', 'correctAnswer'] : ['question']
  return {
    type: 'json_schema',
    json_schema: {
      name: quiz ? 'learnmate_quiz' : 'learnmate_questions',
      strict: true,
      schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            minItems: count,
            maxItems: count,
            items: { type: 'object', properties, required, additionalProperties: false },
          },
        },
        required: ['questions'],
        additionalProperties: false,
      },
    },
  }
}

function maxTokensFor(count, quiz) {
  return quiz ? count * 110 + 60 : count * 35 + 50
}

function questionKey(question) {
  return question.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function uniqueQuestions(questions) {
  const seen = new Set()
  return questions.filter((question) => {
    const key = questionKey(question.question)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function generateQuizBatch(source, batchSize, difficulty, existingQuestions = []) {
  const existing = existingQuestions.map((question) => questionKey(question.question)).join(' | ')
  const prompt = `Create exactly ${batchSize} ${difficulty} MCQs. Return JSON only. Each item has a short question, exactly 4 short answer options, and correctAnswer copied character-for-character from one option. Use only the source. Avoid these existing questions: ${existing || 'none'}\nSOURCE:\n${source}`
  const retryPrompt = `Create exactly ${batchSize} new short MCQs as JSON. Each needs 4 short options and correctAnswer copied exactly from one option. Do not repeat questions. Use only this source:\n${source}`
  let lastError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = await requestAI(attempt ? retryPrompt : prompt, responseFormatFor(batchSize, true), maxTokensFor(batchSize, true))
      const questions = validateQuizQuestions(data?.questions, source)
      if (questions.length === batchSize) return questions
      lastError = new Error(`LM Studio returned ${questions.length} of ${batchSize} requested questions.`)
    } catch (error) {
      lastError = error
    }
  }
  throw lastError || new Error('LM Studio could not generate this question batch.')
}

async function generateQuiz(notes, numberOfQuestions, difficulty, options = {}) {
  if (!Number.isInteger(Number(numberOfQuestions)) || ![3, 5, 10].includes(Number(numberOfQuestions))) throw new Error('Choose 3, 5, or 10 questions.')
  if (notes.length > MAX_SOURCE_LENGTH) throw new Error('Study material is too large. Please upload a smaller document or split it into sections.')
  const source = notes.slice(0, MAX_SOURCE_LENGTH)
  console.log(`[AI SOURCE LENGTH] ${source.length}`)
  const collected = []
  let attempts = 0
  while (collected.length < numberOfQuestions && attempts < numberOfQuestions * 3) {
    const batchSize = numberOfQuestions === 3 && collected.length === 0 ? 3 : Math.min(2, numberOfQuestions - collected.length)
    try {
      const batch = await generateQuizBatch(source, batchSize, difficulty, collected)
      const combined = uniqueQuestions([...collected, ...batch])
      if (combined.length > collected.length) collected.push(...combined.slice(collected.length))
    } catch (error) {
      if (attempts >= numberOfQuestions * 3 - 1) throw error
    }
    attempts += 1
  }
  if (collected.length !== numberOfQuestions) throw new Error(`LM Studio could not produce exactly ${numberOfQuestions} source-grounded quiz questions.`)
  return collected.map((question) => ({ ...question, difficulty }))
}

async function generateQuestions(notes, numberOfQuestions, questionType, options = {}) {
  if (!Number.isInteger(Number(numberOfQuestions)) || ![3, 5, 10].includes(Number(numberOfQuestions))) throw new Error('Choose 3, 5, or 10 questions.')
  if (notes.length > MAX_SOURCE_LENGTH) throw new Error('Study material is too large. Please upload a smaller document or split it into sections.')
  const source = notes.slice(0, MAX_SOURCE_LENGTH)
  console.log(`[AI SOURCE LENGTH] ${source.length}`)
  const prompt = `Create exactly ${numberOfQuestions} ${questionType} study questions. Return only JSON: {"questions":[{"question":""}]}. Keep questions short, distinct, and answerable from the source only.\nSOURCE:\n${source}`
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const retryPrompt = `Return exactly ${numberOfQuestions} short study questions as JSON. Use only this source:\n${source}`
    const data = await requestAI(attempt ? retryPrompt : prompt, responseFormatFor(Number(numberOfQuestions), false), maxTokensFor(Number(numberOfQuestions), false))
    const questions = validateStudyQuestions(data?.questions, source).slice(0, numberOfQuestions)
    if (questions.length === numberOfQuestions) return questions
  }
  throw new Error(`LM Studio could not produce exactly ${numberOfQuestions} source-grounded questions. Try a smaller number or provide more study material.`)
}

module.exports = { generateQuiz, generateQuestions }
