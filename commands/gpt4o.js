const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "🧠💡 Je réfléchis à votre réponse… 💡🧠");

        // Construire l'URL de l'API avec le prompt et l'UID de l'utilisateur
        const apiUrl = `https://llama-api-nine.vercel.app/gemma29?question=${encodeURIComponent(prompt)}&uid=${senderId}`;
        const response = await axios.get(apiUrl);

        // Extraire la question de l'utilisateur et la réponse de l'API
        const { question: userQuestion, response: botResponse } = response.data;

        // Formater la réponse complète
        const formattedReply = `
🇲🇬 𝗠𝗔𝗗𝗔 𝗕𝗢𝗧 🇲🇬
❤️ 𝗩𝗼𝗶𝗰𝗶 𝘃𝗼𝘁𝗿𝗲 𝗾𝘂𝗲𝘀𝘁𝗶𝗼𝗻 : ${userQuestion}
✅ 𝗥𝗲́𝗽𝗼𝗻𝘀𝗲 : ${botResponse}
        `.trim();

        // Envoyer la réponse formatée à l'utilisateur
        await sendMessage(senderId, formattedReply);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, `
🇲🇬 𝗠𝗔𝗗𝗔 𝗕𝗢𝗧 🇲🇬
❌ Une erreur s'est produite lors du traitement de votre question.
        `.trim());
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "axtral",  // Le nom de la commande
    description: "Permet de discuter avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'axtral <message>' pour poser une question ou démarrer une conversation."  // Comment utiliser la commande
};
