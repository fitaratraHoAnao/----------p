const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stocker les résultats de recherche pour suivre les choix de l'utilisateur
let videoResults = [];

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur demande une recherche YouTube
        if (prompt.toLowerCase().startsWith("youtube ")) {
            const query = prompt.slice(8).trim(); // Extraire le nom de l'artiste après "youtube"
            
            // Effectuer la recherche via l'API
            const searchUrl = `https://api-improve-production.up.railway.app/yt/search?q=${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl);

            // Stocker les résultats pour les sélections ultérieures
            videoResults = response.data.items;

            // Construire la réponse pour l'utilisateur avec les titres des vidéos
            let reply = "Voici les résultats pour \"" + query + "\" :\n\n";
            videoResults.forEach((video, index) => {
                reply += `${index + 1}. ${video.snippet.title}\n`;
            });

            await sendMessage(senderId, reply);
        } 
        // Vérifier si l'utilisateur sélectionne un numéro de vidéo pour téléchargement
        else if (!isNaN(prompt) && videoResults.length > 0) {
            const videoIndex = parseInt(prompt) - 1;

            // Valider l'index
            if (videoIndex >= 0 && videoIndex < videoResults.length) {
                const videoId = videoResults[videoIndex].id.videoId;
                const downloadUrl = `https://api-improve-production.up.railway.app/yt/download?url=https://www.youtube.com/watch?v=${videoId}&format=mp3`;
                
                const downloadResponse = await axios.get(downloadUrl);

                // Préparer la réponse avec le lien de téléchargement
                const audioUrl = downloadResponse.data.audio;
                const title = downloadResponse.data.info.title;
                const artist = downloadResponse.data.info.artist;
                
                const downloadMessage = `Téléchargement de "${title}" par ${artist} : ${audioUrl}`;
                await sendMessage(senderId, downloadMessage);
            } else {
                await sendMessage(senderId, "Veuillez sélectionner un numéro valide parmi les résultats listés.");
            }
        } else {
            await sendMessage(senderId, "Commande invalide. Veuillez utiliser 'youtube <nom de l'artiste>' ou sélectionner un numéro de vidéo.");
        }
    } catch (error) {
        console.error("Erreur lors de l'appel aux API YouTube :", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche ou du téléchargement.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Permet de rechercher des vidéos YouTube d'un artiste et de télécharger le fichier audio.",  // Description de la commande
    usage: "Envoyez 'youtube <nom de l'artiste>' pour rechercher des vidéos, puis un numéro pour télécharger le MP3."  // Comment utiliser la commande
};
