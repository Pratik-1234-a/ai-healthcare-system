const { Configuration, OpenAIApi } = require('openai');
const promptTemplates = require('../utils/promptTemplates');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateSummary = async (patientData) => {
  try {
    const prompt = promptTemplates.generatePatientSummaryPrompt(patientData);

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
};

module.exports = {
  generateSummary,
};
