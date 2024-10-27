const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur a une session active
        if (!userSessions[senderId]) {
            // Initialiser la session avec la commande "trans"
            userSessions[senderId] = { waitingForLang: true };
            await sendMessage(senderId, "Bonjour! Dans quelle langue souhaitez-vous traduire votre texte ?");
            return;
        }

        // Si l'utilisateur a indiqué une langue, nous appelons l'API de traduction
        if (userSessions[senderId].waitingForLang) {
            // Sauvegarder la langue sélectionnée
            userSessions[senderId].language = prompt.toLowerCase();
            userSessions[senderId].waitingForLang = false;
            await sendMessage(senderId, "Parfait ! Envoyez le texte que vous souhaitez traduire.");
        } else {
            // Appel à l'API Popcat pour traduire le texte
            const language = userSessions[senderId].language;
            const apiUrl = `https://api.popcat.xyz/translate?to=${language}&text=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl);
            
            // Envoyer la traduction
            const translatedText = response.data.translated;
            await sendMessage(senderId, translatedText);

            // Remettre en attente de la langue pour la prochaine traduction
            userSessions[senderId].waitingForLang = true;
            await sendMessage(senderId, "Dans quelle langue souhaitez-vous traduire le prochain texte ?");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de traduction:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "trans",  // Le nom de la commande
    description: "Permet de traduire un texte dans la langue choisie.",  // Description de la commande
    usage: "Envoyez 'trans <texte>' pour démarrer une session de traduction."  // Comment utiliser la commande
};
