const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // API pour rechercher les vidéos par artiste ou titre
        const searchApiUrl = "https://youtube-api-rest-test.vercel.app/recherche?titre=westlife";
        const videoDetailsApiUrl = "https://youtube-api-rest-test.vercel.app/recherche/video?titre=my%20love&chanteur=westlife";

        // Appeler l'API pour rechercher les vidéos de Westlife
        const searchResponse = await axios.get(searchApiUrl);
        const searchResults = searchResponse.data;

        // Filtrer le résultat pour trouver la vidéo désirée
        const videoData = searchResults.find(video => video.titre.includes("My Love"));

        // Si la vidéo est trouvée, appeler l'API pour obtenir l'URL de la vidéo
        if (videoData) {
            const videoResponse = await axios.get(videoDetailsApiUrl);
            const videoUrl = videoResponse.data.url;

            // Envoyer le lien de la vidéo
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
            await sendMessage(senderId, `Voici la vidéo que vous avez demandée : ${videoData.titre}`);
        } else {
            await sendMessage(senderId, "Désolé, la vidéo demandée n'a pas été trouvée.");
        }
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
