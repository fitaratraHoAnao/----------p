const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Initialiser une session si l'utilisateur n'en a pas
        if (!userSessions[senderId]) {
            userSessions[senderId] = { waitingForSong: true };
            await sendMessage(senderId, "Envoyez le nom de la chanson pour obtenir ses paroles.");
            return;
        }

        // Si une chanson est en attente, appeler l'API des paroles
        if (userSessions[senderId].waitingForSong) {
            const songName = encodeURIComponent(prompt);
            const apiUrl = `https://api.popcat.xyz/lyrics?song=${songName}`;
            const response = await axios.get(apiUrl);

            // Extraire les informations de la chanson
            const songData = response.data;
            if (songData && songData.image) {
                const reply = `**Titre :** ${songData.title}\n` +
                              `**Artiste :** ${songData.artist}\n` +
                              `**Paroles :**\n${songData.lyrics}`;

                // Envoyer les informations de la chanson avec l'image
                await sendMessage(senderId, reply);
                
                // Envoyer l'image en pièce jointe
                await sendMessage(senderId, {
                    attachment: {
                        type: 'image',
                        payload: {
                            url: songData.image,
                            is_reusable: true
                        }
                    }
                });

                // Réinitialiser la session pour attendre une nouvelle chanson
                userSessions[senderId].waitingForSong = true;
            } else {
                await sendMessage(senderId, "Aucune information trouvée pour cette chanson.");
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API des paroles:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre requête.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "chanson",  // Le nom de la commande
    description: "Permet de rechercher et d'envoyer les paroles d'une chanson avec une image associée.",  // Description de la commande
    usage: "Envoyez 'chanson <nom de la chanson>' pour obtenir les paroles et l'image de la chanson."  // Comment utiliser la commande
};
