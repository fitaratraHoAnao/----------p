const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Informer l'utilisateur que cela peut prendre un certain temps
        await sendMessage(senderId, "Veuillez patienter, la recherche de la vidéo peut prendre quelques instants...");

        // Faire une requête à l'API pour rechercher la vidéo
        const apiUrl = "https://youtube-api-milay.vercel.app/recherche?titre=Black%20Nadia";
        const response = await axios.get(apiUrl);

        // Vérifier si des vidéos ont été trouvées
        if (response.data.videos && response.data.videos.length > 0) {
            // Prendre la première vidéo trouvée
            const firstVideo = response.data.videos[0];
            const videoUrl = firstVideo.url; // URL de la vidéo

            // Envoyer un message informant que l'envoi de la vidéo est en cours
            await sendMessage(senderId, "Envoi de la vidéo en cours, veuillez patienter...");

            // Envoyer le message avec la vidéo
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
            await sendMessage(senderId, "La vidéo a été envoyée : " + firstVideo.title);
        } else {
            // Aucune vidéo trouvée
            await sendMessage(senderId, "Désolé, aucune vidéo trouvée pour 'Black Nadia'.");
        }
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
