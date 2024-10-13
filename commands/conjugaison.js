const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Fonction pour découper un message en plusieurs morceaux
function splitMessageIntoChunks(message, maxLength = 2000) {
    const chunks = [];
    let start = 0;

    while (start < message.length) {
        chunks.push(message.slice(start, start + maxLength));
        start += maxLength;
    }

    return chunks;
}

module.exports = async (senderId, verbe) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je cherche la conjugaison du verbe...");

        // Appeler l'API de conjugaison avec le verbe donné par l'utilisateur
        const apiUrl = `https://conjugaison-finale.vercel.app/conjugaison?verbe=${encodeURIComponent(verbe)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la clé 'response' dans la réponse de l'API
        const conjugaison = response.data.response;

        // Reformater la réponse de l'API pour correspondre à la structure souhaitée
        const formattedResponse = `✅${verbe.charAt(0).toUpperCase() + verbe.slice(1)}\n${conjugaison.replace(/\n+/g, '\n')}`;

        // Découper la réponse en morceaux de taille appropriée (par exemple 2000 caractères max)
        const messageChunks = splitMessageIntoChunks(formattedResponse);

        // Envoyer les morceaux successivement avec un délai
        for (const chunk of messageChunks) {
            await sendMessage(senderId, chunk);
            await new Promise(resolve => setTimeout(resolve, 1500));  // Délai de 1.5 seconde entre chaque envoi
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de conjugaison:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération de la conjugaison.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "conjugaison",  // Le nom de la commande
    description: "Permet d'obtenir la conjugaison d'un verbe.",  // Description de la commande
    usage: "Envoyez 'conjugaison <verbe>' pour obtenir la conjugaison du verbe."  // Comment utiliser la commande
};
