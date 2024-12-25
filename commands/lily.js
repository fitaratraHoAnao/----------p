const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API
const BASE_API_URL = 'http://sgp1.hmvhostings.com:25743/lily?q=';

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'ai' et en supprimant les espaces superflus
    const prompt = userText.slice(4).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "📲💫 Patientez, la réponse arrive… 💫📲");

        // Appeler l'API avec le prompt fourni
        const apiUrl = `${BASE_API_URL}${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.lily[0]?.text || "Désolé, je n'ai pas pu obtenir de réponse.";

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Lily:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "lily", // Le nom de la commande
    description: "Discutez avec Lily, une assistante IA prête à répondre à vos questions.", // Description de la commande
    usage: "Envoyez 'lily <votre question>' pour discuter avec l'IA." // Comment utiliser la commande
};
