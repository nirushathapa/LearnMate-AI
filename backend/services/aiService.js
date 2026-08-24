function createMockQuiz(numberOfQuestions, difficulty) {
  const templates = [
    ['What is the main idea of the study notes?', ['The central concept', 'A minor detail', 'An unrelated topic', 'None of these'], 'The central concept'],
    ['Which statement best supports the notes?', ['A key supporting fact', 'A random opinion', 'A different subject', 'No statement'], 'A key supporting fact'],
    ['What should a student remember from this topic?', ['The core definition', 'Only the title', 'A separate example', 'Nothing'], 'The core definition'],
  ]
  return Array.from({ length: numberOfQuestions }, (_, index) => {
    const template = templates[index % templates.length]
    return { question: template[0], options: template[1], correctAnswer: template[2], difficulty }
  })
}

function createMockQuestions(numberOfQuestions, questionType) {
  return Array.from({ length: numberOfQuestions }, (_, index) => ({
    question: `${questionType === 'Long Answer' ? 'Explain in detail' : 'Describe'} the key concept from your notes (question ${index + 1}).`,
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

async function generateQuiz(notes, numberOfQuestions, difficulty) {
  try {
    const data = await requestAI(`Create ${numberOfQuestions} ${difficulty} multiple-choice questions from these notes. Return JSON with a questions array. Each item must have question, options (exactly four strings), and correctAnswer. Notes: ${notes}`)
    if (data?.questions?.length) return data.questions
  } catch (error) {
    console.warn(error.message)
  }
  return createMockQuiz(numberOfQuestions, difficulty)
}

async function generateQuestions(notes, numberOfQuestions, questionType) {
  try {
    const data = await requestAI(`Create ${numberOfQuestions} ${questionType} study questions from these notes. Return JSON with a questions array. Each item must have only question. Notes: ${notes}`)
    if (data?.questions?.length) return data.questions
  } catch (error) {
    console.warn(error.message)
  }
  return createMockQuestions(numberOfQuestions, questionType)
}

module.exports = { generateQuiz, generateQuestions }
