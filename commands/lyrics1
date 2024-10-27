const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Initialiser une session si l'utilisateur n'en a pas
        if (!userSessions[senderId]) {
            userSessions[senderId] = { waitingForSong: true };
            await sendMessage(senderId, "Envoyez le nom de la chanson pour obtenir les paroles.");
            return;
        }

        // Si une chanson est en attente, appeler l'API des paroles
        if (userSessions[senderId].waitingForSong) {
            const songName = encodeURIComponent(prompt);
            const apiUrl = `https://api.popcat.xyz/lyrics?song=${songName}`;
            const response = await axios.get(apiUrl);

            // Extraire les informations des paroles
            const lyricsData = response.data;
            let reply = `**Titre:** ${lyricsData.title}\n` +
                        `**Artiste:** ${lyricsData.artist}\n` +
                        `**Image:** ${lyricsData.image}\n\n` +
                        `**Paroles:**\n${lyricsData.lyrics}`;

            // Envoyer les paroles de la chanson
            await sendMessage(senderId, reply);

            // Réinitialiser la session pour attendre une nouvelle chanson
            userSessions[senderId].waitingForSong = true;
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API des paroles:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre requête.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "lyrics",  // Le nom de la commande
    description: "Permet de rechercher les paroles d'une chanson.",  // Description de la commande
    usage: "Envoyez 'lyrics <nom de la chanson>' pour obtenir les paroles de la chanson."  // Comment utiliser la commande
};
