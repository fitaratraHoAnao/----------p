const { sendMessage } = require('./sendMessage');

// Importer les états utilisateur partagés
const { userStates } = require('./handleMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  // Gérer les actions en fonction du payload reçu
  switch (payload) {
    case 'traduction fr':
      userStates[senderId] = { targetLang: 'fr' }; // Enregistrer la langue choisie
      sendMessage(senderId, { text: 'Vous avez choisi la traduction en Français. Veuillez entrer le texte à traduire.' }, pageAccessToken);
      break;
    case 'traduction en':
      userStates[senderId] = { targetLang: 'en' }; // Enregistrer la langue choisie
      sendMessage(senderId, { text: 'Vous avez choisi la traduction en Anglais. Veuillez entrer le texte à traduire.' }, pageAccessToken);
      break;
    case 'traduction es':
      userStates[senderId] = { targetLang: 'es' }; // Enregistrer la langue choisie
      sendMessage(senderId, { text: 'Vous avez choisi la traduction en Espagnol. Veuillez entrer le texte à traduire.' }, pageAccessToken);
      break;
    default:
      sendMessage(senderId, { text: `Payload non reconnu : ${payload}` }, pageAccessToken);
  }
}

module.exports = { handlePostback };
