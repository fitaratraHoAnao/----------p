const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Un objet pour stocker les états des utilisateurs (à implémenter dans une base de données pour une vraie application)
const userStates = {};

module.exports = async (senderId, userText) => {
    // Vérifier l'état de l'utilisateur
    const state = userStates[senderId] || {};

    if (!state.searching) {
        // Extraire le prompt en retirant le préfixe 'youtube ' et en supprimant les espaces superflus
        const prompt = userText.slice(7).trim(); // 'youtube ' a 7 caractères

        // Vérifier si le prompt est vide
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

            // Enregistrer l'état de recherche et les résultats
            userStates[senderId] = { searching: true, videos: videos };

        } catch (error) {
            console.error('Erreur lors de l\'appel à l\'API YouTube:', error);
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre demande.');
        }
    } else {
        // Gérer la sélection de la vidéo par l'utilisateur
        const selectedVideoIndex = parseInt(userText.trim(), 10) - 1; // Numéro saisi par l'utilisateur

        if (isNaN(selectedVideoIndex) || selectedVideoIndex < 0 || selectedVideoIndex >= state.videos.length) {
            await sendMessage(senderId, 'Sélection invalide. Veuillez répondre avec un numéro de vidéo valide.');
            return;
        }

        const selectedVideo = state.videos[selectedVideoIndex];
        await sendMessage(senderId, `Vous avez sélectionné "${selectedVideo.title}". Souhaitez-vous le fichier en audio ou en vidéo ? Répondez par "audio" ou "vidéo".`);

        // Passer à l'état suivant
        userStates[senderId].formatChoiceExpected = true;
    }

    // Vérifier si un choix de format est attendu
    if (state.formatChoiceExpected) {
        const formatChoice = userText.trim().toLowerCase(); // 'audio' ou 'vidéo'
        
        if (formatChoice === 'audio' || formatChoice === 'vidéo') {
            await sendMessage(senderId, formatChoice === 'audio' ? "Téléchargement de l'audio en cours..." : "Téléchargement de la vidéo en cours...");
            const downloadFunc = formatChoice === 'audio' ? downloadAudio : downloadVideo;

            // Télécharger le fichier en fonction du format choisi
            const file = await downloadFunc(selectedVideo.videoId); // Fonction à créer pour le téléchargement

            // Envoyer le fichier téléchargé à l'utilisateur
            await sendMessage(senderId, `Voici votre fichier ${formatChoice}. Profitez-en !`);
        } else {
            await sendMessage(senderId, 'Veuillez répondre par "audio" ou "vidéo".');
            return;
        }

        // Réinitialiser l'état de l'utilisateur
        delete userStates[senderId];
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
    // Retourner le chemin du fichier audio
}

async function downloadVideo(videoId) {
    // Logique pour télécharger la vidéo à l'aide de pytube ou d'une bibliothèque similaire
    // Retourner le chemin du fichier vidéo
}
