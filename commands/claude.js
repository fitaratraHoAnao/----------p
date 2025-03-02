const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stockage de l'historique des messages
let conversations = {}; 

module.exports = async (senderId, prompt, uid) => { 
    try {
        // Initialiser l'historique de la conversation si ce n'est pas encore fait
        if (!conversations[senderId]) {
            conversations[senderId] = [];
        }

        // Ajouter le prompt de l'utilisateur à l'historique
        conversations[senderId].push({ role: 'user', content: prompt });

        // Envoyer un message d'attente magnifique avec des emojis
        await sendMessage(senderId, "✨🤖 Un instant magique... Je prépare une réponse éclairée pour toi ! ✨⌛");

        // Construire l'URL de l'API pour résoudre la question
        const apiUrl = `http://sgp1.hmvhostings.com:25743/claude?message=${encodeURIComponent(prompt)}`;

        // Appel à l'API de Claude
        const response = await axios.get(apiUrl);
        
        // Récupérer la réponse de l'API
        const reply = response.data.claude[0].text;

        // Ajouter la réponse de Claude à l'historique
        conversations[senderId].push({ role: 'assistant', content: reply });

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
