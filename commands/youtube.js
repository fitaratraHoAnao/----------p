const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stocker temporairement les résultats de recherche pour chaque utilisateur
let searchResultsMap = {};

module.exports = async (senderId, messageText) => {
    try {
        // Vérifier si l'utilisateur a déjà effectué une recherche et attend un choix
        if (searchResultsMap[senderId] && !isNaN(messageText)) {
            // Si le message est un nombre, alors l'utilisateur veut télécharger une vidéo
            const choice = parseInt(messageText);
            const searchResults = searchResultsMap[senderId];
            
            // Vérifier si le choix est valide
            if (choice >= 1 && choice <= searchResults.length) {
                // Récupérer la vidéo sélectionnée
                const selectedVideo = searchResults[choice - 1];

                // Envoyer un message de confirmation que le téléchargement est en cours
                await sendMessage(senderId, "Téléchargement en cours...");

                // Appeler l'API Flask pour télécharger la vidéo choisie
                const apiUrl = `https://recherche-youtube.onrender.com/regarde`;
                const response = await axios.post(apiUrl, { choice });

                // Récupérer la réponse formatée
                const message = response.data.error ? response.data.error : "La vidéo a été téléchargée avec succès.";

                // Envoyer la réponse de l'API à l'utilisateur
                await sendMessage(senderId, message);

                // Effacer les résultats de recherche après le téléchargement
                delete searchResultsMap[senderId];
            } else {
                await sendMessage(senderId, "Choix invalide. Veuillez entrer un numéro correspondant à une vidéo.");
            }
        } else {
            // Si le message ne correspond pas à un choix, considérer que c'est une recherche
            const parts = messageText.split(' ');
            const commandGroup = parts[0];  // Ici, "youtube"
            const query = parts.slice(1).join(' ');  // La requête de recherche

            if (commandGroup.toLowerCase() === 'youtube') {
                // Envoyer un message de confirmation que la recherche est en cours
                await sendMessage(senderId, "Recherche en cours...");

                // Appeler l'API Flask pour la recherche
                const apiUrl = `https://recherche-youtube.onrender.com/recherche?query=${encodeURIComponent(query)}`;
                const response = await axios.get(apiUrl);

                // Récupérer les résultats de recherche
                const searchResults = response.data.message ? response.data.message.split("\n").slice(1) : [];
                if (searchResults.length === 0) {
                    await sendMessage(senderId, "Aucun résultat trouvé.");
                } else {
                    // Stocker les résultats dans la mémoire temporaire
                    searchResultsMap[senderId] = searchResults;

                    // Envoyer la liste des vidéos à l'utilisateur
                    await sendMessage(senderId, `Voici la liste des vidéos disponibles:\n${searchResults.join('\n')}`);
                    await sendMessage(senderId, "Veuillez entrer un numéro pour télécharger la vidéo correspondante.");
                }
            } else {
                await sendMessage(senderId, "Commande inconnue. Veuillez commencer votre message par 'youtube' suivi de la recherche.");
            }
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Flask:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre commande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Rechercher et télécharger des vidéos YouTube.",  // Description de la commande
    usage: "Envoyez 'youtube <terme>' pour rechercher des vidéos et choisissez un numéro pour télécharger."  // Comment utiliser la commande 
};
