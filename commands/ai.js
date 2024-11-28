const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

const BASE_API_URL = 'https://api.kenliejugarap.com/ministral-3b-paid/';
const DATE_API_URL = 'https://date-heure.vercel.app/date?heure=Madagascar';

module.exports = async (senderId, userText) => {
    const prompt = userText.slice(3).trim();

    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API principale pour obtenir la réponse à la question
        const apiUrl = `${BASE_API_URL}?question=${encodeURIComponent(prompt)}&userId=${senderId}`;
        const aiResponse = await axios.get(apiUrl);
        const aiReply = aiResponse.data.response;

        // Appeler l'API de date pour obtenir la date et l'heure actuelles
        const dateResponse = await axios.get(DATE_API_URL);

        // Vérifier et extraire la date et l'heure
        const currentDate = dateResponse.data.date_actuelle || "Date inconnue";
        const currentTime = dateResponse.data.heure_actuelle || "Heure inconnue";

        // Préparer le message final
        const finalMessage = `
🤖 • 𝗕𝗿𝘂𝗻𝗼𝗖𝗵𝗮𝘁
━━━━━━━━━━━━━━
❓𝗬𝗼𝘂𝗿 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${prompt}
━━━━━━━━━━━━━━
✅ 𝗔𝗻𝘀𝘄𝗲𝗿: ${aiReply}
━━━━━━━━━━━━━━
⏰ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: ${currentDate}, ${currentTime} à Madagascar

🇲🇬Lien Facebook de l'admin: ✅https://www.facebook.com/bruno.rakotomalala.7549
        `;

        // Attendre avant d'envoyer le message final pour simuler un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));
        await sendMessage(senderId, finalMessage);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

module.exports.info = {
    name: "ai",
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",
    usage: "Envoyez 'ai <votre question>' pour obtenir une réponse."
};
