const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Assurez-vous que sendMessage est correctement importé

module.exports = async (senderId, userText, event) => {
    // Vérifiez si l'utilisateur a fourni une requête YouTube
    const args = userText.split(" ").slice(1);
    
    if (!args.length) {
        return sendMessage(event.threadID, "Veuillez fournir un titre de vidéo YouTube ou un lien.");
    }

    const query = args.join(" ");
    const apiKey = 'AIzaSyCbeDS39uH7GqzitZpfMNDi9x2bpptLH6A'; // Remplacez par votre clé API YouTube
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
        const response = await axios.get(apiUrl);

        if (response.data.items.length > 0) {
            const video = response.data.items[0];
            const videoUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`;
            const message = `Voici la vidéo trouvée :\n${video.snippet.title}\n${videoUrl}`;
            sendMessage(event.threadID, message);
        } else {
            sendMessage(event.threadID, "Aucune vidéo trouvée pour cette recherche.");
        }
    } catch (error) {
        console.error('Erreur lors de la requête à l\'API YouTube:', error.message);
        sendMessage(event.threadID, "Une erreur est survenue lors de la recherche de la vidéo YouTube.");
    }
};

// Informations sur la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Recherche une vidéo sur YouTube en utilisant un titre ou un lien.",  // Description de la commande
    usage: "Envoyez 'youtube <titre>' pour rechercher une vidéo sur YouTube."  // Comment utiliser la commande
};
