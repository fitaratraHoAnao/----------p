const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Recherche en cours...");

        // Appeler l'API de recherche YouTube avec le prompt de l'utilisateur
        const apiUrlSearch = `https://api-improve-production.up.railway.app/yt/search?q=${encodeURIComponent(prompt)}`;
        const searchResponse = await axios.get(apiUrlSearch);

        // Récupérer et traiter les résultats
        const items = searchResponse.data.items;
        if (!items || items.length === 0) {
            await sendMessage(senderId, "Aucune vidéo trouvée pour cet artiste.");
            return;
        }

        // Créer une liste de titres numérotés
        let message = "Voici les vidéos trouvées :\n";
        items.forEach((item, index) => {
            message += `${index + 1}. ${item.snippet.title}\n`;
        });

        // Envoyer la liste de vidéos à l'utilisateur
        await sendMessage(senderId, message);

        // Attendre le choix de l'utilisateur pour télécharger
        // (Ajouter un gestionnaire pour récupérer le choix de l'utilisateur et lancer le téléchargement si besoin)

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API YouTube:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "youtube",  // Le nom de la commande
    description: "Recherche des vidéos d'un artiste sur YouTube.",  // Description de la commande
    usage: "Envoyez 'youtube <nom de l'artiste>' pour rechercher des vidéos et sélectionner celles à télécharger."  // Comment utiliser la commande
};
