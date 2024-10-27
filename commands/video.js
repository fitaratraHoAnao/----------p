const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Remplace par la logique de récupération de l'URL de la vidéo
        const videoUrl = "https://www.youtube.com/watch?v=ffgO4yshj-0"; // URL de la vidéo YouTube

        // Envoyer un message avec la vidéo
        await sendMessage(senderId, {
            attachment: {
                type: 'video', // Spécifier que c'est une vidéo
                payload: {
                    url: videoUrl, // URL de la vidéo
                    is_reusable: true
                }
            }
        });

        // Envoyer un message final une fois la vidéo envoyée
        await sendMessage(senderId, "La vidéo a été envoyée.");
    } catch (error) {
        console.error("Erreur lors de l'envoi de la vidéo:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de l'envoi de la vidéo.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "video",  // Le nom de la commande
    description: "Envoie une vidéo basée sur le texte saisi.",  // Description de la commande
    usage: "Envoyez 'video <titre>' pour envoyer une vidéo."  // Comment utiliser la commande
};
