const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

const TRANSLATE_API_URL = "https://libretranslate.com/translate";

module.exports = {
  name: "traduction",
  description: "Traduit le texte dans la langue choisie.",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const targetLang = args[0]; // La langue cible (fr, en, es)
    const textToTranslate = args.slice(1).join(' '); // Le texte à traduire

    if (!textToTranslate) {
      return sendMessage(senderId, { text: 'Veuillez fournir un texte à traduire.' }, pageAccessToken);
    }

    try {
      const response = await axios.post(TRANSLATE_API_URL, {
        q: textToTranslate,
        source: "auto", // Détecte automatiquement la langue du texte source
        target: targetLang
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const translatedText = response.data.translatedText;
      sendMessage(senderId, { text: `Traduction : ${translatedText}` }, pageAccessToken);
    } catch (error) {
      console.error('Erreur de traduction :', error);
      sendMessage(senderId, { text: 'Une erreur est survenue lors de la traduction.' }, pageAccessToken);
    }
  }
};
