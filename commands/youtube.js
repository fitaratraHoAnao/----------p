const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const userVideos = {}; // Stocker les vidéos pour chaque utilisateur

const youtubeCommand = async (senderId, query) => {
    // URLs des API YouTube
    const searchApiUrl = `https://youtube-api-milay.vercel.app/recherche?titre=${encodeURIComponent(query)}`;
    const videoApiUrl = `https://youtube-api-milay.vercel.app/videos?watch=`; // URL de base pour obtenir les vidéos par numéro

    try {
        const response = await axios.get(searchApiUrl);
        const videos = response.data.videos; // Assurez-vous que cette clé correspond à la structure de votre réponse

        if (videos.length === 0) {
            await sendMessage(senderId, "Aucune vidéo trouvée pour votre recherche.");
            return;
        }

        // Envoyer les titres des vidéos à l'utilisateur
        let messageContent = "Voici les vidéos trouvées :\n";
        videos.forEach((video, index) => {
            messageContent += `${index + 1}. ${video.title}\n`;
        });

        await sendMessage(senderId, messageContent);

        // Demander à l'utilisateur de choisir une vidéo
        await sendMessage(senderId, "Veuillez choisir une vidéo en tapant son numéro.");

        // Sauvegarder les vidéos pour cet utilisateur
        userVideos[senderId] = videos; // Assurez-vous que `userVideos` est défini pour stocker les vidéos
    } catch (error) {
        console.error('Erreur lors de la recherche YouTube:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche de vidéos.");
    }
};

// Gestion de la sélection de la vidéo
const handleVideoSelection = async (senderId, videoIndex) => {
    const selectedVideo = userVideos[senderId][videoIndex];
    const videoUrl = `https://www.youtube.com/watch?v=${selectedVideo.id}`; // Remplacez `id` par la clé appropriée de votre objet vidéo

    // Préparer le message pour envoyer la vidéo
    const videoMessage = {
        type: "video",
        files: [videoUrl] // Envoi de l'URL de la vidéo comme pièce jointe
    };

    await sendMessage(senderId, videoMessage);
    delete userVideos[senderId]; // Supprimer les vidéos après l'envoi
};

// Informations sur la commande
module.exports = {
    youtubeCommand,
    handleVideoSelection,
    info: {
        name: 'youtube',
        description: 'Recherche des vidéos YouTube par titre.',
        usage: 'youtube [titre]' // Exemple d'utilisation
    }
};
