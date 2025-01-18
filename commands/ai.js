const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration des URL de base de votre API
const BASE_API_URL = 'https://llama-api-nine.vercel.app/llama';
const DATE_API_URL = 'https://date-heure.vercel.app/date?heure=Madagascar';

// Objet pour stocker le contexte des conversations par utilisateur
const userConversations = {};

module.exports = async (senderId, userText) => {
    // Vérifier si le message est vide ou ne contient que des espaces
    if (!userText.trim()) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Initialiser ou mettre à jour le contexte de conversation pour cet utilisateur
        if (!userConversations[senderId]) {
            userConversations[senderId] = [];
        }
        userConversations[senderId].push(userText);

        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Construire l'URL de l'API avec la question et l'uid
        const apiUrl = `${BASE_API_URL}?question=${encodeURIComponent(userText)}&uid=${senderId}`;
        const response = await axios.get(apiUrl);
        const reply = response.data.response;

        // Appeler l'API de date pour obtenir la date et l'heure actuelles
        const dateResponse = await axios.get(DATE_API_URL);
        const { date_actuelle, heure_actuelle } = dateResponse.data;

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Formater et envoyer la réponse complète
        const formattedReply = `
🤖 • 𝗕𝗿𝘂𝗻𝗼𝗖𝗵𝗮𝘁
━━━━━━━━━━━━━━
❓𝗬𝗼𝘂𝗿 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${userText}
━━━━━━━━━━━━━━
✅ 𝗔𝗻𝘀𝘄𝗲𝗿: ${reply}
━━━━━━━━━━━━━━
⏰ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: ${date_actuelle}, ${heure_actuelle} à Madagascar

🇲🇬Lien Facebook de l'admin: ✅https://www.facebook.com/bruno.rakotomalala.7549
        `.trim();

        await sendMessage(senderId, formattedReply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, `
🤖 • 𝗕𝗿𝘂𝗻𝗼𝗖𝗵𝗮𝘁
━━━━━━━━━━━━━━
❓𝗬𝗼𝘂𝗿 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: ${userText}
━━━━━━━━━━━━━━
✅ 𝗔𝗻𝘀𝘄𝗲𝗿: Désolé, une erreur s'est produite lors du traitement de votre question.
━━━━━━━━━━━━━━
⏰ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲: Impossible de récupérer l'heure.

🇲🇬Lien Facebook de l'admin: ✅https://www.facebook.com/bruno.rakotomalala.7549
        `.trim());
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "ai",  // Le nom de la commande
    description: "Posez directement votre question ou donnez un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez simplement votre question ou sujet."  // Comment utiliser la commande
};
