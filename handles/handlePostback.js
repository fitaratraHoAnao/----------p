const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  // Vérifier et exécuter des actions en fonction du payload
  switch (payload) {
    case 'traduction fr':
      sendMessage(senderId, { text: 'Entrez le texte à traduire en Français.' }, pageAccessToken);
      break;
    case 'traduction en':
      sendMessage(senderId, { text: 'Enter the text to translate to English.' }, pageAccessToken);
      break;
    case 'traduction es':
      sendMessage(senderId, { text: 'Ingrese el texto para traducir al Español.' }, pageAccessToken);
      break;
    default:
      sendMessage(senderId, { text: `Payload reçu : ${payload}` }, pageAccessToken);
  }
}

module.exports = { handlePostback };
