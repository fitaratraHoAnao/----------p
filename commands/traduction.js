const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Définir l'URL de l'API de traduction (dans ce cas, LibreTranslate)
const TRANSLATE_API_URL = "https://libretranslate.com/translate";

module.exports = {
  name: "traduction",
  author: "Bruno",
  description: "Propose des langues pour la traduction.",

  async execute(senderId, args, pageAccessToken, sendMessage) {
    // Si aucun argument n'est fourni, proposer les langues à l'utilisateur avec Quick Replies
    if (!args || args.length === 0) {
      const quickReplies = {
        text: "Choisissez une langue de traduction :",
        quick_replies: [
          {
            content_type: "text",
            title: "🇫🇷 Français",
            payload: "traduction fr"
          },
          {
            content_type: "text",
            title: "🇬🇧 English",
            payload: "traduction en"
          },
          {
            content_type: "text",
            title: "🇪🇸 Español",
            payload: "traduction es"
          }
        ]
      };
      sendMessage(senderId, quickReplies, pageAccessToken);
    } else {
      // Si l'utilisateur a déjà choisi une langue, traduire le message
      const targetLang = args[0]; // Exemple : "fr" pour français
      const textToTranslate = args.slice(1).join(' '); // Le texte à traduire

      if (!textToTranslate) {
        return sendMessage(senderId, { text: 'Veuillez fournir un texte à traduire.' }, pageAccessToken);
      }

      // Appeler l'API de traduction avec Axios
      try {
        const response = await axios.post(TRANSLATE_API_URL, {
          q: textToTranslate,
          source: "auto", // Détecter automatiquement la langue source
          target: targetLang // Langue cible définie par l'utilisateur
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        // Envoyer la traduction à l'utilisateur
        const translatedText = response.data.translatedText;
        sendMessage(senderId, { text: `Traduction : ${translatedText}` }, pageAccessToken);

      } catch (error) {
        console.error('Error while translating:', error);
        sendMessage(senderId, { text: 'Désolé, une erreur est survenue lors de la traduction.' }, pageAccessToken);
      }
    }
  }
};
