const axios = require('axios');

module.exports = {
  name: 'gemini',
  description: 'Ask a question to the Gemini AI',
  author: 'ChatGPT',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');

    try {
      // Envoyer un message d'attente
      sendMessage(senderId, { text: 'Please wait, I am processing your request...' }, pageAccessToken);

      // Appeler l'API Gemini
      const response = await callGeminiAPI(prompt);

      // Ajouter le titre à la réponse
      const title = '🇲🇬CHATBOT MADAGASCAR🇲🇬';
      const fullResponse = `${title}\n\n${response}`;

      // Si la réponse dépasse 2000 caractères, divisez-la en plusieurs morceaux
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

// Fonction pour appeler l'API Gemini
async function callGeminiAPI(prompt) {
  try {
    const apiUrl = `https://gemini-yvcl.onrender.com/api/ai/chat?prompt=${encodeURIComponent(prompt)}&id=40`;
    const response = await axios.get(apiUrl);
    return response.data.response;
  } catch (error) {
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
}

// Fonction pour diviser un message en morceaux
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
