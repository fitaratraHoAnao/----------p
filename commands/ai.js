const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

const aiCommand = async (senderId, userText) => {
    const prompt = userText.slice(3).trim(); // Enlever 'ai ' et enlever les espaces vides

    // Vérifier si le prompt est vide
    if (!prompt) {
        sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        const response = await axios.get(`https://nash-rest-api-production.up.railway.app/nashbot?prompt=${encodeURIComponent(prompt)}`);
        const reply = response.data.response; // Assurez-vous que votre API renvoie 'response'.

        // Envoyer la réponse à l'utilisateur
        sendMessage(senderId, reply);
    } catch (error) {
        console.error('Error calling the AI API:', error);
        sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "ai",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA via l'API Nashbot.",  // Description de la commande
    usage: "Envoyez 'ai <votre question>' pour obtenir une réponse."  // Comment utiliser la commande
};

module.exports = aiCommand;
