const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // URL d'une vidéo accessible (exemple vidéo MP4 publique)
        const videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

        // Envoyer un message avec la vidéo
        await sendMessage(senderId, {
            attachment: {
                type: 'video',
                payload: {
                    url: videoUrl,
                    is_reusable: true
                }
            }
        });

        // Envoyer un message final une fois la vidéo envoyée
        await sendMessage(senderId, "Voici la vidéo que vous avez demandée.");
    } catch (error) {
        console.error("Erreur lors de l'envoi de la vidéo :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "video",  // Le nom de la commande
    description: "Envoie un fichier vidéo à l'utilisateur.",  // Description de la commande
    usage: "Envoyez 'video' pour recevoir un fichier vidéo."  // Comment utiliser la commande
};
