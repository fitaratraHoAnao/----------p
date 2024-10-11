const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, searchQuery) => {
    try {
        // Envoyer un message de confirmation que la recherche a commencé
        await sendMessage(senderId, `Recherche de "${searchQuery}" sur Wikipedia...`);

        // Appeler l'API Wikipedia avec la requête de l'utilisateur
        const apiUrl = `https://nash-rest-api-production.up.railway.app/wikipedia?search=${encodeURIComponent(searchQuery)}`;
        const response = await axios.get(apiUrl);

        // Récupérer les données pertinentes de la réponse de l'API
        const { title, extract, page_url } = response.data;

        // Formater la réponse avec les informations reçues
        const reply = `*${title}*\n\n${extract}\n\nEn savoir plus: ${page_url}`;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse formatée à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Wikipedia:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche sur Wikipedia.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "wikipedia",  // Le nom de la commande
    description: "Recherche des informations sur Wikipedia.",  // Description de la commande
    usage: "Envoyez 'wikipedia <recherche>' pour obtenir un résumé de Wikipedia."  // Comment utiliser la commande
};
