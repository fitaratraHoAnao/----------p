const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation de la recherche en cours
        await sendMessage(senderId, "Recherche de vidéos en cours...");

        // Effectuer la recherche avec l'API YouTube
        const query = encodeURIComponent(prompt);
        const apiUrl = `https://youtube-api-milay.vercel.app/recherche?titre=${query}`;
        const response = await axios.get(apiUrl);

        // Récupérer les vidéos de la réponse de l'API
        const videos = response.data.videos;
        console.log("Vidéos trouvées :", videos);

        if (videos && videos.length > 0) {
            // Sélectionner la première vidéo trouvée
            const video = videos[0];
            const videoUrl = video.url;

            // Envoyer la vidéo à l'utilisateur
            await sendMessage(senderId, {
                attachment: {
                    type: 'video',
                    payload: {
                        url: videoUrl,
                        is_reusable: true
                    }
                }
            });

            // Message de confirmation
            await sendMessage(senderId, "Voici la vidéo que vous avez demandée !");
        } else {
            // Aucune vidéo trouvée
            await sendMessage(senderId, "Aucune vidéo trouvée pour votre recherche.");
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des vidéos:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

module.exports.info = {
    name: "video",
    description: "Recherche et envoie des vidéos basées sur le texte saisi.",
    usage: "Envoyez 'video <recherche>' pour rechercher des vidéos."
};
