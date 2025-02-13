const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt, uid) => { 
    try {
        // Envoyer un message d'attente magnifique avec des emojis
        await sendMessage(senderId, "✨🤖 Un instant magique... Je prépare une réponse éclairée pour toi ! ✨⌛");

        // Construire l'URL de l'API pour résoudre la question
        const apiUrl = `https://slogan-api.onrender.com/api/ai?model=claude-3-sonnet-20240229&system=You%20are%20a%20helpful%20assistant&question=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Claude AI:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors du traitement de ta demande. Réessaie plus tard ! 🤖");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "claude",  // Le nom de la commande
    description: "Pose ta question à Claude AI pour obtenir une réponse détaillée.",  // Description de la commande
    usage: "Envoyez 'claude <question>' pour poser une question à Claude AI."  // Comment utiliser la commande
};
