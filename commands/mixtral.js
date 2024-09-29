const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'gem29' et en supprimant les espaces superflus
    const prompt = userText.slice(6).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API Gem29 avec le prompt fourni
        const apiUrl = `https://mixtral-8b.vercel.app/?ask=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Gem29:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mixtral",  // Le nom de la commande
    description: "Poser une question ou un sujet, et obtenir une réponse générée via l'API Gem29.",  // Description de la commande
    usage: "Envoyez 'mixtral <votre question>' pour obtenir une réponse via l'API."  // Comment utiliser la commande
};
