const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API
const BASE_API_URL = 'https://api.joshweb.click/api/liner';

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'phi' et en supprimant les espaces superflus
    const prompt = userText.slice(3).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "💭📡 Connexion au flux d’informations… 📡💭");

        // Appeler l'API avec le prompt fourni
        const apiUrl = `${BASE_API_URL}?q=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "liner", // Le nouveau nom de la commande
    description: "Posez une question ou donnez un sujet, et recevez une réponse générée par l'IA.", // Nouvelle description
    usage: "Envoyez 'liner <votre question>' pour obtenir une réponse." // Nouveau mode d'emploi
};
