const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

const gem29Command = async (senderId, userText) => {
    const prompt = userText.slice(6).trim(); // Enlever 'gem29 ' et enlever les espaces vides

    // Vérifier si le prompt est vide
    if (!prompt) {
        sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        const response = await axios.get(`https://gem2-9b-it-njiv.vercel.app/api?ask=${encodeURIComponent(prompt)}`);
        const reply = response.data.response; // Assurez-vous que votre API renvoie 'response'.

        // Envoyer la réponse à l'utilisateur
        sendMessage(senderId, reply);
    } catch (error) {
        console.error('Error calling the gem29 API:', error);
        sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "gem29",  // Le nom de la commande
    description: "Poser une question ou un sujet, et obtenir une réponse générée via l'API Gem29.",  // Description de la commande
    usage: "Envoyez 'gem29 <votre question>' pour obtenir une réponse via l'API."  // Comment utiliser la commande
};

module.exports = gem29Command;
