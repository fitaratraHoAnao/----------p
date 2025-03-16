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

        // ➡️ Nouveau message d'attente dynamique
        await sendMessage(senderId, "🌍✨ Patiente un peu... Je vais chercher une réponse incroyable pour toi ! 🚀🔮");

        // Construire l'URL de l'API pour résoudre la question
        const apiUrl = `https://api-hugging-face-mixtral-vercel.vercel.app/deepseek?question=${encodeURIComponent(prompt)}&uid=${uid}`;

        // Appel à l'API
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.response;

        // Ajouter la réponse de l'API à l'historique
        conversations[senderId].push({ role: 'assistant', content: reply });

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error("🚨 Erreur lors de l'appel à l'API DeepSeek :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "❌ Oups ! Une erreur est survenue lors du traitement de ta demande. Essaie à nouveau plus tard ! 🤖");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "espa", // Changer le nom de la commande
    description: "Pose ta question à Espa AI et reçois une réponse rapide et détaillée ! 🌟", // Nouvelle description
    usage: "Tape 'espa <question>' pour poser une question à Espa AI." // Nouveau format d'usage
};
