const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare le calendrier pour l'année spécifiée...");

        // Appeler l'API du calendrier avec l'année demandée par l'utilisateur
        const year = prompt.trim();
        const apiUrl = `https://calendrier-api.vercel.app/recherche?calendrier=${year}`;
        const response = await axios.get(apiUrl);

        // Récupérer les données du calendrier
        const calendrierData = response.data.calendrier_2024[0].jours;

        // Transformer les données en une chaîne de caractères formatée
        const formattedResponse = calendrierData.map(jour => 
            `Jour : ${jour.nombre} - ${jour.description} (${jour.lettre})${jour.info ? ' - Info : ' + jour.info : ''}`
        ).join('\n');

        // Découper la réponse en morceaux de 2000 caractères
        const chunks = formattedResponse.match(/.{1,2000}/g);

        // Envoyer les morceaux de réponse successivement
        for (const chunk of chunks) {
            await sendMessage(senderId, chunk);
            // Pause de 2 secondes entre chaque envoi pour éviter les limites de taux
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API du calendrier:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "calendrier",  // Nouveau nom de la commande
    description: "Affiche les jours et événements du calendrier pour une année spécifiée.",  // Nouvelle description
    usage: "Envoyez 'calendrier <année>' pour voir les jours et événements de cette année."  // Nouveau mode d'emploi
};
