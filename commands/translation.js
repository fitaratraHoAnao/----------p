const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "🎩✨ Un peu de magie en préparation… ✨🎩");

        // Déterminer la langue source et définir l'URL de l'API de traduction
        const targetLang = /[a-zA-Z]/.test(prompt) ? 'fr' : 'en';
        const apiUrl = `https://api.popcat.xyz/translate?to=${targetLang}&text=${encodeURIComponent(prompt)}`;
        
        const response = await axios.get(apiUrl);

        // Récupérer le texte traduit
        const translatedText = response.data.translated;

        // Formater la réponse complète
        const formattedReply = `
🇲🇬Voici la traduction de votre texte🇲🇬:
${translatedText}
        `.trim();

        // Envoyer la réponse formatée à l'utilisateur
        await sendMessage(senderId, formattedReply);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API de traduction :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, `
🇲🇬 𝗣𝗔𝗬𝗦 𝗠𝗔𝗗𝗔𝗚𝗔𝗦𝗖𝗔𝗥 🇲🇬
❌ Une erreur s'est produite lors de la traduction de votre texte.
        `.trim());
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "translation",  // Le nouveau nom de la commande
    description: "Permet de traduire automatiquement un texte en français ou en anglais.",  // Nouvelle description
    usage: "Envoyez 'translation <texte>' pour obtenir une traduction automatique."  // Nouvelle utilisation
};
