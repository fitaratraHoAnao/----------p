const axios = require('axios');
const sendMessage = require('../handles/sendMessage');
const userSessions = {}; // Pour stocker l'état de chaque utilisateur

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur est en train de sélectionner une vidéo
        if (userSessions[senderId] && !isNaN(prompt)) {
            const videoChoice = parseInt(prompt) - 1;
            const videoData = userSessions[senderId].videos[videoChoice];

            if (!videoData) {
                await sendMessage(senderId, "Choix invalide. Veuillez réessayer.");
                return;
            }

            // Appeler l'API de téléchargement avec l'ID de la vidéo sélectionnée
            const apiUrlDownload = `https://api-improve-production.up.railway.app/yt/download?url=https://www.youtube.com/watch?v=${videoData.id.videoId}&format=mp4&quality=360`;
            const downloadResponse = await axios.get(apiUrlDownload);

            // Envoyer le lien de téléchargement à l'utilisateur
            await sendMessage(senderId, `Téléchargement prêt : ${downloadResponse.data.video}`);
            
            // Réinitialiser la session
            delete userSessions[senderId];

        } else {
            // Démarrer une nouvelle recherche
            await sendMessage(senderId, "Recherche en cours...");

            // Appeler l'API de recherche YouTube
            const apiUrlSearch = `https://api-improve-production.up.railway.app/yt/search?q=${encodeURIComponent(prompt)}`;
            const searchResponse = await axios.get(apiUrlSearch);

            const items = searchResponse.data.items;
            if (!items || items.length === 0) {
                await sendMessage(senderId, "Aucune vidéo trouvée pour cet artiste.");
                return;
            }

            // Stocker les résultats dans userSessions
            userSessions[senderId] = { videos: items };

            // Envoyer la liste de vidéos à l'utilisateur
            let message = "Voici les vidéos trouvées :\n";
            items.forEach((item, index) => {
                message += `${index + 1}. ${item.snippet.title}\n`;
            });
            await sendMessage(senderId, message + "\nVeuillez envoyer le numéro de votre choix pour télécharger.");
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API YouTube:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

module.exports.info = {
    name: "youtube",
    description: "Recherche des vidéos d'un artiste sur YouTube et permet de télécharger la vidéo choisie.",
    usage: "Envoyez 'youtube <nom de l'artiste>' pour rechercher des vidéos et sélectionnez celles à télécharger."
};
