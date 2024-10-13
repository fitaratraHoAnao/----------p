const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

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

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la conjugaison du verbe à l'utilisateur
        await sendMessage(senderId, formattedResponse);
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
