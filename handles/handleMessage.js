const { sendMessage } = require('./sendMessage');
const { execute: traductionCommand } = require('../commands/traduction');

// Stocker l'état de chaque utilisateur (langue choisie)
const userStates = {};

async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  const messageText = event.message.text.trim().toLowerCase();

  // Si l'utilisateur envoie "traduction", afficher les quick replies pour choisir la langue
  if (messageText === 'traduction') {
    return sendMessage(senderId, {
      text: 'Choisissez une langue pour la traduction :',
      quick_replies: [
        {
          content_type: 'text',
          title: 'Français',
          payload: 'traduction fr',
        },
        {
          content_type: 'text',
          title: 'Anglais',
          payload: 'traduction en',
        },
        {
          content_type: 'text',
          title: 'Espagnol',
          payload: 'traduction es',
        }
      ]
    }, pageAccessToken);
  }

  // Vérifier si l'utilisateur a déjà sélectionné une langue
  if (userStates[senderId] && userStates[senderId].targetLang) {
    // L'utilisateur a choisi une langue, donc on effectue la traduction
    const targetLang = userStates[senderId].targetLang;
    
    // Appeler la commande de traduction avec le texte de l'utilisateur
    await traductionCommand(senderId, [targetLang, messageText], pageAccessToken, sendMessage);

    // Réinitialiser l'état de l'utilisateur après la traduction
    delete userStates[senderId].targetLang;
  } else {
    // Si aucune langue n'est sélectionnée, rappeler à l'utilisateur de choisir une langue
    sendMessage(senderId, { text: 'Veuillez d\'abord choisir une langue en envoyant "traduction".' }, pageAccessToken);
  }
}

module.exports = { handleMessage };
