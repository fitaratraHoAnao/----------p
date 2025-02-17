const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Dictionnaire pour stocker l'historique des conversations
const conversationHistory = {};

module.exports = async (senderId, prompt, uid) => {
    try {
        // Vérifier si l'utilisateur a déjà une conversation en cours
        if (!conversationHistory[senderId]) {
            conversationHistory[senderId] = [];
        }

        // Ajouter le prompt de l'utilisateur à l'historique
        conversationHistory[senderId].push({ role: 'user', message: prompt });

        // Nouveau message d'attente avec des emojis
        await sendMessage(senderId, "🪄✨ Je réfléchis à une réponse magique... Patiente un instant ! 🧠🌟");

        // Construire l'URL de l'API pour résoudre la question
        const apiUrl = `https://api-test-one-brown.vercel.app/qwen-coder?q=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(uid)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Ajouter la réponse du bot à l'historique
        conversationHistory[senderId].push({ role: 'bot', message: reply });

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue lors du traitement de ta demande. Réessaie plus tard ! 🤖");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "qwen",  // Le nom de la commande
    description: "Pose ta question et obten une réponse magique avec Qwen-Coder.",  // Description de la commande
    usage: "Envoyez 'qwen <question>' pour poser une question à Qwen-Coder."  // Comment utiliser la commande
};
