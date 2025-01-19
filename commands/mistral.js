const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation avec un joli message d'attente
        await sendMessage(senderId, "✨🌟 Magie en cours... Préparez-vous à découvrir la réponse ! 🌟✨");

        // Appeler l'API avec le prompt de l'utilisateur et l'UID
        const apiUrl = `https://api-mistral-hugging-face.vercel.app/mistralhugging?question=${encodeURIComponent(prompt)}&uid=${senderId}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const botResponse = response.data[0].generated_text; // Réponse de l'API

        // Formater la réponse avec un joli design
        const formattedReply = `
🌺✨ 𝗘𝗦𝗧𝗘𝗦-𝗩𝗢𝗨𝗦 𝗣𝗥𝗘𝗧𝗦 𝗣𝗢𝗨𝗥 𝗟𝗔 𝗠𝗔𝗚𝗜𝗘 ? ✨🌺
🎉 𝗤𝗨𝗘𝗦𝗧𝗜𝗢𝗡: ${prompt}
✨ 𝗥𝗘́𝗣𝗢𝗡𝗦𝗘: ${botResponse}
🌸✨ 𝗘𝗡𝗝𝗢𝗬 𝗟𝗘𝗦 𝗘𝗦𝗧𝗥𝗘𝗦 𝗠𝗔𝗚𝗜𝗤𝗨𝗘𝗦 ✨🌸
        `.trim();

        // Envoyer la réponse formatée à l'utilisateur
        await sendMessage(senderId, formattedReply);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, `
❌ 𝗘𝗥𝗥𝗘𝗨𝗥 𝗗𝗘 𝗠𝗔𝗚𝗜𝗘... ❌
😞 𝗨𝗻 𝗽𝗿𝗼𝗯𝗹𝗲̀𝗺𝗲 𝗮 𝗲́𝗽𝗹𝗼𝗱𝗲́ 𝗮𝘂 𝗠𝗮𝗴𝗶𝗲 🤯
        `.trim());
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "mistral",  // Le nom de la commande
    description: "Permet de discuter avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'mistral <message>' pour poser une question ou démarrer une conversation."  // Comment utiliser la commande
};
