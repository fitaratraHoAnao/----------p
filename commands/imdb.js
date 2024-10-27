const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Stocker l'état de la conversation pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Initialiser une session si l'utilisateur n'en a pas
        if (!userSessions[senderId]) {
            userSessions[senderId] = { waitingForMovie: true };
            await sendMessage(senderId, "Envoyez le nom du film ou de la série que vous souhaitez rechercher.");
            return;
        }

        // Si un film est en attente, appeler l'API IMDb
        if (userSessions[senderId].waitingForMovie) {
            const movieName = encodeURIComponent(prompt);
            const apiUrl = `https://api.popcat.xyz/imdb?q=${movieName}`;
            const response = await axios.get(apiUrl);

            // Extraire les informations du film
            const movieData = response.data;
            let reply = `**Titre:** ${movieData.title} (${movieData.year})\n` +
                        `**Durée:** ${movieData.runtime}\n` +
                        `**Genres:** ${movieData.genres}\n` +
                        `**Réalisateur:** ${movieData.director}\n` +
                        `**Acteurs:** ${movieData.actors}\n` +
                        `**Note:** ${movieData.rating}/10\n` +
                        `**Plot:** ${movieData.plot}\n\n` +
                        `**IMDb URL:** ${movieData.imdburl}`;

            // Envoyer les informations du film
            await sendMessage(senderId, reply);

            // Réinitialiser la session pour attendre un nouveau film
            userSessions[senderId].waitingForMovie = true;
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API IMDb:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre requête.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "imdb",  // Le nom de la commande
    description: "Permet de rechercher des informations sur un film ou une série.",  // Description de la commande
    usage: "Envoyez 'imdb <nom du film>' pour obtenir des détails sur le film ou la série."  // Comment utiliser la commande
};
