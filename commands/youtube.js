const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, userText) => {
    const prompt = userText.slice(3).trim();
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir un titre pour rechercher des vidéos.');
        return;
    }

    try {
        await sendMessage(senderId, "Recherche des vidéos en cours...");

        const apiUrl = `https://youtubeako.onrender.com/search?titre=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const videos = response.data;

        if (videos.length === 0) {
            await sendMessage(senderId, 'Aucune vidéo trouvée.');
            return;
        }

        // Formatage des résultats
        let reply = "Voici les vidéos trouvées :\n";
        videos.forEach((video, index) => {
            reply += `${index + 1}. ${video.title}\n`;
        });

        reply += "Veuillez sélectionner une vidéo en répondant avec le numéro correspondant.";
        await sendMessage(senderId, reply);

        // Attendez une réponse de l'utilisateur avec le numéro de la vidéo
        // Vous devez gérer cela dans votre logique d'état de conversation

        // Exemple pour le choix de la vidéo
        // Supposons que l'utilisateur a choisi "2"
        const selectedVideoIndex = 1; // index choisi par l'utilisateur (2ème vidéo)
        const selectedVideo = videos[selectedVideoIndex];

        await sendMessage(senderId, `Vous avez sélectionné "${selectedVideo.title}". Souhaitez-vous le fichier en audio ou en vidéo ? Répondez par "audio" ou "vidéo".`);

        // Attendre une réponse de l'utilisateur pour le choix de format
        // Exemple pour le format
        const formatChoice = 'audio'; // 'audio' ou 'vidéo' basé sur la réponse de l'utilisateur

        if (formatChoice === 'audio') {
            // Télécharger et envoyer en format audio
            await sendMessage(senderId, "Téléchargement de l'audio en cours...");
            // Logique pour télécharger en audio
            // Utiliser pytube ou une bibliothèque similaire pour télécharger le fichier audio
            const audioFile = await downloadAudio(selectedVideo.videoId); // Fonction à créer pour le téléchargement audio
            await sendMessage(senderId, `Voici votre fichier audio. Profitez-en !`);
            // Logique pour envoyer le fichier audio à l'utilisateur
        } else {
            // Télécharger et envoyer en format vidéo
            await sendMessage(senderId, "Téléchargement de la vidéo en cours...");
            // Logique pour télécharger en vidéo
            const videoFile = await downloadVideo(selectedVideo.videoId); // Fonction à créer pour le téléchargement vidéo
            await sendMessage(senderId, `Voici votre vidéo. Profitez-en !`);
            // Logique pour envoyer le fichier vidéo à l'utilisateur
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API YouTube:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre demande.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",
    description: "Recherche des vidéos YouTube par titre ou chanteur.",
    usage: "Envoyez 'youtube <titre>' pour rechercher des vidéos."
};

// Exemple de fonctions pour télécharger audio ou vidéo
async function downloadAudio(videoId) {
    // Logique pour télécharger l'audio à l'aide de pytube ou d'une bibliothèque similaire
}

async function downloadVideo(videoId) {
    // Logique pour télécharger la vidéo à l'aide de pytube ou d'une bibliothèque similaire
}
