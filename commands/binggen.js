const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args, pageAccessToken) => {
  if (args.length === 0) {
    return sendMessage(senderId, { text: 'Please provide a prompt. Example: /binggen dog' }, pageAccessToken);
  }

  const prompt = args.join(' ');
  const apiUrl = `https://jerome-web.onrender.com/service/api/bing?prompt=${encodeURIComponent(prompt)}`;

  try {
    // Envoyer un message de confirmation que le prompt est en cours de traitement
    await sendMessage(senderId, { text: 'Message reçu, je prépare les images...' }, pageAccessToken);

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.success && data.result && data.result.length > 0) {
      const imageMessages = data.result.slice(0, 4).map((imageUrl) => ({
        attachment: {
          type: 'image',
          payload: {
            url: imageUrl,
            is_reusable: true
          }
        }
      }));

      for (const imageMessage of imageMessages) {
        await sendMessage(senderId, imageMessage, pageAccessToken);
      }
    } else {
      sendMessage(senderId, { text: `Sorry, no images were found for "${prompt}".` }, pageAccessToken);
    }
  } catch (error) {
    console.error('Error fetching Bing images:', error);
    sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
  }
};

// Ajouter les informations de la commande
module.exports.info = {
  name: 'binggen',  // Le nom de la commande
  description: 'Generate and send images directly from Bing based on your prompt.',  // Description de la commande
  usage: 'Envoyez "binggen <prompt>" pour générer des images à partir de Bing.'  // Comment utiliser la commande
};
