const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Déterminer s'il s'agit d'une requête pour des vidéos
        const query = encodeURIComponent(prompt);
        const apiUrl = `https://youtube-api-milay.vercel.app/recherche?titre=${query}`;

        // Envoyer un message de confirmation de recherche
        await sendMessage(senderId, "Recherche de vidéos en cours...");

        // Appeler l'API de recherche de vidéos
        const response = await axios.get(apiUrl);

        // Récupérer les vidéos de la réponse de l'API
        const videos = response.data.videos;

        // Vérifier si des vidéos sont retournées
        if (videos && videos.length > 0) {
            // Prendre la première vidéo de la liste
            const video = videos[0];
            const videoUrl = video.url;

            // Envoyer un message d'attente pour le téléchargement
            await sendMessage(senderId, "Téléchargement de la vidéo en cours...");

            // Envoi de la vidéo en pièce jointe
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
            await sendMessage(senderId, "Voici la vidéo que vous avez demandée !");
        } else {
            // Si aucune vidéo n'est trouvée, informer l'utilisateur
            await sendMessage(senderId, "Aucune vidéo trouvée pour votre recherche.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des vidéos:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "video",  // Le nom de la commande
    description: "Recherche et envoie une vidéo basée sur le texte saisi.",  // Description de la commande
    usage: "Envoyez 'video <recherche>' pour rechercher une vidéo."  // Comment utiliser la commande
};
