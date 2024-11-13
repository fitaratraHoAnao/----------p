const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API
const BASE_API_URL = 'https://api.kenliejugarap.com/blackbox-claude/';

// Stockage des sessions pour conserver le contexte de la conversation
const userSessions = {};

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'claude' et en supprimant les espaces superflus
    const prompt = userText.slice(6).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    // Initialiser la session de l'utilisateur s'il n'existe pas encore
    if (!userSessions[senderId]) {
        userSessions[senderId] = [];
    }

    // Ajouter le prompt actuel à l'historique de conversation de l'utilisateur
    userSessions[senderId].push({ role: 'user', content: prompt });

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "📲💫 Patientez, la réponse arrive… 💫📲");

        // Inclure l'historique complet de la conversation dans la requête API
        const conversationHistory = userSessions[senderId]
            .map(entry => `${entry.role}: ${entry.content}`)
            .join('\n');

        // Appeler l'API avec l'historique de la conversation et l'ID utilisateur
        const apiUrl = `${BASE_API_URL}?text=${encodeURIComponent(conversationHistory)}&userId=${senderId}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Ajouter la réponse du bot à l'historique de conversation de l'utilisateur
        userSessions[senderId].push({ role: 'bot', content: reply });

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Claude:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "claude",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez 'claude <votre question>' pour obtenir une réponse."  // Comment utiliser la commande
};
