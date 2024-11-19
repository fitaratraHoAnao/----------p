const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API
const BASE_API_URL = 'https://api.kenliejugarap.com/midijourney/';

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'ai' et en supprimant les espaces superflus
    const prompt = userText.slice(3).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "📡🌌 Voyage à travers l’inconnu… 🌌📡");

        // Appeler l'API avec le prompt fourni et l'ID utilisateur
        const apiUrl = `${BASE_API_URL}?question=${encodeURIComponent(prompt)}&userId=${senderId}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Cohere:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "midijourney",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez 'midijourney <votre question>' pour obtenir une réponse."  // Comment utiliser la commande
};

