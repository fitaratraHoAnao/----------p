const { callGeminiAPI } = require('../utils/callGeminiAPI');

module.exports = {
  name: 'gemini',
  description: 'Ask a question to the Gemini AI',
  author: 'ChatGPT',
  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    try {
      sendMessage(senderId, { text: 'Please wait, I am processing your request...' }, pageAccessToken);
      const response = await callGeminiAPI(prompt);

      // Ajouter le titre à chaque réponse
      const title = '🇲🇬CHATBOT MADAGASCAR🇲🇬';
      const fullResponse = `${title}\n\n${response}`;

      // Split the response into chunks if it exceeds 2000 characters
      const maxMessageLength = 2000;
      if (fullResponse.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(fullResponse, maxMessageLength);
        for (const message of messages) {
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text: fullResponse }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
