const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

const youtube = async (senderId, searchQuery) => {
    const apiUrl = `https://youtube-api-milay.vercel.app/recherche?titre=${encodeURIComponent(searchQuery)}`;

    try {
        // Appel à l'API pour rechercher des vidéos
        const response = await axios.get(apiUrl);
        const videos = response.data.videos;

        // Vérifier si des vidéos ont été trouvées
        if (videos.length === 0) {
            await sendMessage(senderId, "Désolé, aucune vidéo trouvée pour votre recherche.");
            return;
        }

        // Construire le message avec les titres des vidéos trouvées
        let videoList = "Voici quelques vidéos que j'ai trouvées :\n";
        videos.forEach((video, index) => {
            videoList += `${index + 1}. ${video.title}\n`;
        });

        await sendMessage(senderId, videoList);

        // Proposer à l'utilisateur de choisir une vidéo par son numéro
        await sendMessage(senderId, "Veuillez répondre avec le numéro de la vidéo pour obtenir le lien.");

        // Attendre la réponse de l'utilisateur
        const userResponse = await waitForUserResponse(senderId); // Implémenter cette fonction pour attendre la réponse

        const selectedIndex = parseInt(userResponse.text) - 1; // Convertir en index (0-based)
        
        if (selectedIndex < 0 || selectedIndex >= videos.length) {
            await sendMessage(senderId, "Numéro invalide. Veuillez réessayer.");
            return;
        }

        const selectedVideo = videos[selectedIndex];

        // Appel à la deuxième API pour obtenir le lien vidéo
        const videoApiUrl = `https://youtube-api-milay.vercel.app/videos?watch=${selectedVideo.videoId}`;
        const videoResponse = await axios.get(videoApiUrl);

        // Envoyer la vidéo en pièce jointe
        await sendMessage(senderId, {
            text: `Voici votre vidéo : ${videoResponse.data.title}`,
            attachment: {
                type: "video",
                payload: {
                    url: videoResponse.data.url
                }
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des vidéos :", error.message);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche de vidéos.");
    }
};

// Fonction pour attendre la réponse de l'utilisateur
const waitForUserResponse = async (senderId) => {
    // Implémentez ici la logique pour écouter et retourner la réponse de l'utilisateur.
    // Cela pourrait impliquer l'utilisation de WebSocket ou d'autres mécanismes d'écoute.
};

module.exports = youtube;
module.exports.info = {
    name: 'youtube',
    description: 'Rechercher des vidéos YouTube sur un artiste ou un titre',
};
