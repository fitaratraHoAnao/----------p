const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Déclaration des URL de vos APIs
const BASE_API_URL = 'https://api.kenliejugarap.com/ministral-3b-paid/';
const DATE_API_URL = 'https://date-heure.vercel.app/date?heure=Madagascar';

// Gestion des sessions utilisateur pour maintenir l'état actif
const userSessions = {};

module.exports = async (senderId, userText) => {
    // Vérifier si l'utilisateur a activé la commande "ai"
    if (!userSessions[senderId] && !userText.startsWith("ai ")) {
        await sendMessage(senderId, 'Pour démarrer, utilisez la commande "ai <votre question>".');
        return;
    }

    // Activer ou réutiliser la session de l'utilisateur
    if (userText.startsWith("ai ")) {
        userSessions[senderId] = true; // Activer l'état "IA active" pour l'utilisateur
        userText = userText.slice(3).trim(); // Supprimer le préfixe "ai" du message
    }

    // Vérifier si le message est vide
    if (!userText.trim()) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API principale pour obtenir la réponse IA
        const apiUrl = `${BASE_API_URL}?question=${encodeURIComponent(userText)}&userId=${senderId}`;
        const aiResponse = await axios.get(apiUrl);

        // Appeler l'API de la date pour obtenir l'heure actuelle
        const dateResponse = await axios.get(DATE_API_URL);

        // Extraire les données des réponses des deux APIs
        const aiReply = aiResponse.data.response;
        const currentDate = dateResponse.data.date_actuelle;
        const currentTime = dateResponse.data.heure_actuelle;
        const location = dateResponse.data.localisation;

        // Construire le message final
        const finalMessage = `
🤖 • 𝗕𝗿𝘂𝗻𝗼𝗖𝗵𝗮𝘁
━━━━━━━━━━━━━━
❓𝗬𝗼𝘂𝗿 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${userText}
━━━━━━━━━━━━━━
✅ 𝗔𝗻𝘀𝘄𝗲𝗿: ${aiReply}
━━━━━━━━━━━━━━
⏰ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: ${currentDate}, ${currentTime} à ${location}

🇲🇬Lien Facebook de l'admin: ✅https://www.facebook.com/bruno.rakotomalala.7549
`;

        // Envoyer le message final
        await sendMessage(senderId, finalMessage);
    } catch (error) {
        console.error('Erreur lors de l\'appel à une API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "ai",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour activer et interagir avec l'IA.",  // Description de la commande
    usage: "Envoyez 'ai <votre question>' pour activer l'IA, puis envoyez vos questions directement."  // Comment utiliser la commande
};
