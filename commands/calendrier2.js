const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, year) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API du calendrier avec l'année donnée
        const apiUrl = `https://calendrier-gamma.vercel.app/recherche?calendrier=${encodeURIComponent(year)}`;
        const response = await axios.get(apiUrl);

        // Récupérer le résultat de l'API
        const result = response.data.result;

        // Diviser le message en trois parties pour éviter les limites de longueur
        const parts = [
            result.slice(0, Math.ceil(result.length / 3)),
            result.slice(Math.ceil(result.length / 3), Math.ceil((2 * result.length) / 3)),
            result.slice(Math.ceil((2 * result.length) / 3))
        ];

        // Envoyer les trois parties du message avec un délai entre chaque envoi
        for (const part of parts) {
            await sendMessage(senderId, part);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Délai de 2 secondes entre les messages
        }

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Calendrier:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "calendrier2",  // Le nom de la commande
    description: "Affiche le calendrier d'une année spécifique avec les jours fériés.",  // Description de la commande
    usage: "Envoyez 'calendrier2 <année>' pour obtenir le calendrier détaillé de l'année spécifiée."  // Comment utiliser la commande
};
