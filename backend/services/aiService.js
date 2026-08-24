function createDemoSummary(noteTitle) {
  return {
    summary: `AI summary will be generated here when the AI service is connected. This is a demo summary for ${noteTitle}.`,
    keyPoints: ['Review the main definitions', 'Connect each concept to an example', 'Practice recalling the topic without notes'],
  }
}

function createDemoChatResponse() {
  return 'This is a demo response. Connect an AI provider later to receive personalized answers.'
}

module.exports = { createDemoSummary, createDemoChatResponse }
