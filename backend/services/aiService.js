function getNoteSentences(notes) {
  const content = notes.replace(/Attached material:[\s\S]*$/i, '').replace(/\s+/g, ' ').trim()
  const sentences = content.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length > 20)
  return sentences.length ? sentences : [content || 'the main topic in the study material']
}

function createMockQuiz(notes, numberOfQuestions, difficulty) {
  const sentences = getNoteSentences(notes)
  return Array.from({ length: numberOfQuestions }, (_, index) => {
    const correctAnswer = sentences[index % sentences.length]
    const otherAnswers = sentences.filter((_, sentenceIndex) => sentenceIndex !== index % sentences.length)
    const options = [correctAnswer, ...otherAnswers].slice(0, 4)
    while (options.length < 4) options.push(`Another detail from the study material (${options.length})`)
    return { question: `According to the notes, which statement is correct?`, options: options.sort(() => Math.random() - 0.5), correctAnswer, difficulty }
  })
}

function createMockQuestions(notes, numberOfQuestions, questionType) {
  const sentences = getNoteSentences(notes)
  return Array.from({ length: numberOfQuestions }, (_, index) => ({
    question: `${questionType === 'Long Answer' ? 'Explain in detail' : 'Describe'} this idea from the notes: ${sentences[index % sentences.length]}`,
  }))
}

async function requestAI(prompt) {
  if (!process.env.AI_API_KEY) return null

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.AI_API_KEY}` },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  })
  if (!response.ok) throw new Error('AI request failed.')
  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

async function generateQuiz(notes, numberOfQuestions, difficulty, options = {}) {
  try {
    const data = await requestAI(`Create ${numberOfQuestions} ${difficulty} multiple-choice questions from these notes. Return JSON with a questions array. Each item must have question, options (exactly four strings), and correctAnswer. Notes: ${notes}`)
    if (data?.questions?.length) return data.questions
  } catch (error) {
    console.warn(error.message)
  }
  if (options.requireAI) throw new Error('AI generation is unavailable. Add a valid AI_API_KEY and try again.')
  return createMockQuiz(notes, numberOfQuestions, difficulty)
}

async function generateQuestions(notes, numberOfQuestions, questionType, options = {}) {
  try {
    const data = await requestAI(`Create ${numberOfQuestions} ${questionType} study questions from these notes. Return JSON with a questions array. Each item must have only question. Notes: ${notes}`)
    if (data?.questions?.length) return data.questions
  } catch (error) {
    console.warn(error.message)
  }
  if (options.requireAI) throw new Error('AI generation is unavailable. Add a valid AI_API_KEY and try again.')
  return createMockQuestions(notes, numberOfQuestions, questionType)
}

module.exports = { generateQuiz, generateQuestions }
