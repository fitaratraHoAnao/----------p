const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration des URL de base de vos API
const BASE_API_URL = 'https://api.kenliejugarap.com/ministral-3b-paid/';
const DATE_API_URL = 'https://date-heure.vercel.app/date?heure=Madagascar';

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'ai' et en supprimant les espaces superflus
    const prompt = userText.slice(3).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API principale avec le prompt fourni et l'ID utilisateur
        const apiUrl = `${BASE_API_URL}?question=${encodeURIComponent(prompt)}&userId=${senderId}`;
        const aiResponse = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const aiReply = aiResponse.data.response;

        // Appeler l'API de date pour obtenir l'heure actuelle à Madagascar
        const dateResponse = await axios.get(DATE_API_URL);
        const currentDateTime = dateResponse.data.datetime;

        // Construire le message final avec les formats spécifiés
        const finalMessage = `
🤖 • 𝗕𝗿𝘂𝗻𝗼𝗖𝗵𝗮𝘁
━━━━━━━━━━━━━━
❓𝗬𝗼𝘂𝗿 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${prompt}
━━━━━━━━━━━━━━
✅ 𝗔𝗻𝘀𝘄𝗲𝗿: ${aiReply}
━━━━━━━━━━━━━━
⏰ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: ${currentDateTime} à Madagascar

🇲🇬Lien Facebook de l'admin: ✅https://www.facebook.com/bruno.rakotomalala.7549
        `;

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse formatée à l'utilisateur
        await sendMessage(senderId, finalMessage);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

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
