const axios = require('axios');
const sendMessage = require('../handles/sendMessage');
const userSessions = {}; // Pour stocker l'état de chaque utilisateur

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur est en train de sélectionner un format de téléchargement
        if (userSessions[senderId] && userSessions[senderId].selectedVideo && (prompt.toLowerCase() === "mp4" || prompt.toLowerCase() === "mp3")) {
            const videoData = userSessions[senderId].selectedVideo;
            const format = prompt.toLowerCase();

            // URL pour télécharger en fonction du format choisi
            const apiUrlDownload = `https://api-improve-production.up.railway.app/yt/download?url=https://www.youtube.com/watch?v=${videoData.id.videoId}&format=${format}`;

            // Appel à l'API pour télécharger l'audio ou la vidéo
            const downloadResponse = await axios.get(apiUrlDownload);

            // Envoyer le lien de téléchargement à l'utilisateur
            const responseMessage = format === 'mp4' 
                ? `Téléchargement vidéo prêt : ${downloadResponse.data.video}`
                : `Téléchargement audio prêt : ${downloadResponse.data.audio}`;
                
            await sendMessage(senderId, responseMessage);

            // Réinitialiser la session
            delete userSessions[senderId];

        } else if (userSessions[senderId] && !isNaN(prompt)) {
            // L'utilisateur a choisi un numéro de vidéo
            const videoChoice = parseInt(prompt) - 1;
            const videoData = userSessions[senderId].videos[videoChoice];

            if (!videoData) {
                await sendMessage(senderId, "Choix invalide. Veuillez réessayer.");
                return;
            }

            // Stocker la vidéo sélectionnée et demander le format
            userSessions[senderId].selectedVideo = videoData;
            await sendMessage(senderId, "Quel format souhaitez-vous pour le téléchargement : MP3 (audio) ou MP4 (vidéo) ?");
        
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
            await sendMessage(senderId, message + "\nVeuillez envoyer le numéro de votre choix pour sélectionner une vidéo.");
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API YouTube:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

module.exports.info = {
    name: "youtube",
    description: "Recherche des vidéos d'un artiste sur YouTube et permet de télécharger en audio (MP3) ou vidéo (MP4).",
    usage: "Envoyez 'youtube <nom de l'artiste>' pour rechercher des vidéos et sélectionnez celles à télécharger en audio ou vidéo."
};
