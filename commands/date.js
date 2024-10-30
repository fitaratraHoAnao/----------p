const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare la date et l'heure...");

        // Définir l'URL de l'API avec la localisation en utilisant le prompt
        const apiUrl = `https://date-heure.vercel.app/date?heure=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Extraire la date et l'heure actuelles de la réponse de l'API
        const { date_actuelle, heure_actuelle, localisation } = response.data;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la date et l'heure de l'API à l'utilisateur
        const reply = `Date actuelle à ${localisation}: ${date_actuelle}\nHeure actuelle: ${heure_actuelle}`;
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Date/Heure:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération de la date et de l'heure.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "date",  // Le nom de la commande
    description: "Permet de connaître la date et l'heure actuelles pour un lieu spécifique.",  // Description de la commande
    usage: "Envoyez 'date <lieu>' pour obtenir la date et l'heure actuelles dans un lieu précis."  // Comment utiliser la commande
};
