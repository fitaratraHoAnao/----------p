const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Construire l'URL de l'API avec le lien YouTube
        const apiUrl = `https://api-improve-production.up.railway.app/yt/download?url=${encodeURIComponent(prompt)}&format=mp3`;
        const response = await axios.get(apiUrl);

        // Extraire les informations de la réponse de l'API
        const { message, audio, info } = response.data;

        // Vérifier si le téléchargement a été réussi
        if (message === "Audio downloaded successfully.") {
            // Envoyer les informations à l'utilisateur
            const reply = `
                🎶 Titre : ${info.title}
                👤 Artiste : ${info.artist}
                💽 Album : ${info.album}
                📥 [Télécharger le MP3](${audio})
                🖼️ Vignette : ${info.thumbnail}
            `;
            await sendMessage(senderId, reply);
        } else {
            await sendMessage(senderId, "Désolé, le téléchargement audio a échoué.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de téléchargement YouTube:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Nouveau nom de la commande
    description: "Permet de télécharger l'audio d'une vidéo YouTube en MP3.",  // Nouvelle description de la commande
    usage: "Envoyez 'youtube <lien YouTube>' pour télécharger l'audio de la vidéo."  // Nouveau usage de la commande
};
