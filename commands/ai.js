const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration des URL de vos APIs
const BASE_API_URL = 'https://api.kenliejugarap.com/ministral-3b-paid/';
const DATE_API_URL = 'https://date-heure.vercel.app/date?heure=Madagascar';

module.exports = async (senderId, userText) => {
    // Identifier le préfixe de la commande ("ai ")
    const prefix = "ai ";
    if (!userText.startsWith(prefix)) {
        await sendMessage(senderId, 'Commande non reconnue. Utilisez "ai <votre question>".');
        return;
    }

    // Extraire le texte après le préfixe, en supprimant les espaces superflus
    const prompt = userText.slice(prefix.length).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API principale pour obtenir la réponse IA
        const apiUrl = `${BASE_API_URL}?question=${encodeURIComponent(prompt)}&userId=${senderId}`;
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
❓𝗬𝗼𝘂𝗿 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${prompt}
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
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez 'ai <votre question>' pour obtenir une réponse."  // Comment utiliser la commande
};
