const axios = require('axios');

module.exports = {
  name: "traduction",
  author: "Bruno",
  description: "Translate text between languages. Usage: {p}traduction [sourceLang] [targetLang] [text]",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    try {
      // Vérification du nombre d'arguments
      if (args.length < 3) {
        return sendMessage(senderId, { text: "Please provide source language, target language, and the text to translate." }, pageAccessToken);
      }

      // Extraction des langues et du texte à traduire
      const sourceLang = args[0].toLowerCase(); // Langue source : fr, en, etc.
      const targetLang = args[1].toLowerCase(); // Langue cible : en, es, etc.
      const textToTranslate = encodeURIComponent(args.slice(2).join(" ")); // Texte à traduire

      // URL de l'API de traduction MyMemory
      const apiUrl = `https://api.mymemory.translated.net/get?q=${textToTranslate}&langpair=${sourceLang}|${targetLang}`;

      // Requête vers l'API
      const response = await axios.get(apiUrl);

      // Vérification de la réponse
      if (response.data && response.data.responseData && response.data.responseData.translatedText) {
        const translatedText = response.data.responseData.translatedText;

        // Message avec traduction
        const message = `❤️AI traduction❤️\n\n${translatedText}`;

        // Limite de longueur de message (2000 caractères)
        const maxMessageLength = 2000;
        if (message.length > maxMessageLength) {
          const messages = splitMessageIntoChunks(message, maxMessageLength);
          for (const chunk of messages) {
            sendMessage(senderId, { text: chunk }, pageAccessToken);
          }
        } else {
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text: "Unable to get a translation." }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error making MyMemory API request:', error.message);
      sendMessage(senderId, { text: "An error occurred while processing your translation request." }, pageAccessToken);
    }
  }
};

// Fonction pour découper les messages longs en morceaux
function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let currentChunk = '';
  
  for (const word of message.split(' ')) {
    if (currentChunk.length + word.length + 1 <= chunkSize) {
      currentChunk += (currentChunk ? ' ' : '') + word;
    } else {
      chunks.push(currentChunk);
      currentChunk = word;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

