const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // URL de l'audio à envoyer
        const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

        // Envoyer un message avec l'audio
        await sendMessage(senderId, {
            attachment: {
                type: 'audio',
                payload: {
                    url: audioUrl,
                    is_reusable: true
                }
            }
        });

        // Envoyer un message final une fois l'audio envoyé
        await sendMessage(senderId, "Voici l'audio que vous avez demandé.");
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'audio :", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "audio",  // Le nom de la commande
    description: "Envoie un fichier audio à l'utilisateur.",  // Description de la commande
    usage: "Envoyez 'audio' pour recevoir un fichier audio."  // Comment utiliser la commande
};
