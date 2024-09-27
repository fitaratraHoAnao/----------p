const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'gemma7' et en supprimant les espaces superflus
    const prompt = userText.slice(6).trim(); // 6 caractères pour 'gemma7'

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API avec le prompt fourni
        const apiUrl = `https://create-by-bruno.vercel.app/?ask=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response; // Modifiez en fonction de la structure de la réponse de votre API

        // Vérifier si la réponse est vide
        if (!reply) {
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu générer de réponse. Essayez avec un autre sujet.');
            return;
        }

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        if (error.response) {
            // Erreur de réponse de l'API
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question. (Erreur: ' + error.response.status + ')');
        } else if (error.request) {
            // Erreur de requête
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu atteindre le service. Vérifiez votre connexion Internet.');
        } else {
            // Autres erreurs
            await sendMessage(senderId, 'Une erreur inconnue s\'est produite. Veuillez réessayer.');
        }
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "gemma7",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez 'gemma7 <votre question>' pour obtenir une réponse."  // Comment utiliser la commande
};
