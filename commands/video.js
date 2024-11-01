const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Extraire le titre et le chanteur de la requête utilisateur
        const query = prompt.replace("video", "").trim();

        // Appeler la 2ème API pour obtenir l'URL de la vidéo YouTube
        const videoApiUrl = `https://youtube-api-rest-test.vercel.app/recherche/video?titre=${encodeURIComponent(query)}`;
        const videoResponse = await axios.get(videoApiUrl);
        const videoData = videoResponse.data;

        if (videoData && videoData.url) {
            // Envoyer la vidéo en tant que pièce jointe
            await sendMessage(senderId, {
                attachment: {
                    type: 'video',
                    payload: {
                        url: videoData.url,
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
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "video",  // Le nom de la commande
    description: "Envoie un fichier vidéo à l'utilisateur.",  // Description de la commande
    usage: "Envoyez 'video <titre>' pour recevoir une vidéo spécifique."  // Comment utiliser la commande
};
