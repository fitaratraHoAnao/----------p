const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Créer un objet pour gérer les sessions utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Si l'utilisateur envoie 'date <location>', initialiser la session pour ce userId
        if (prompt.toLowerCase().startsWith("date ")) {
            const location = prompt.slice(5).trim();
            
            // Enregistrer dans userSessions que l'utilisateur a démarré une session avec 'date'
            userSessions[senderId] = { awaitingLocation: true };
            
            // Appel initial de l'API avec la localisation fournie
            const apiUrl = `https://date-heure.vercel.app/date?heure=${encodeURIComponent(location)}`;
            const response = await axios.get(apiUrl);
            const { date_actuelle, heure_actuelle, localisation } = response.data;
            
            // Envoyer la date et l'heure
            const reply = `Date actuelle à ${localisation}: ${date_actuelle}\nHeure actuelle: ${heure_actuelle}`;
            await sendMessage(senderId, reply);
            
        } else if (userSessions[senderId]?.awaitingLocation) {
            // Si l'utilisateur est en attente d'une localisation uniquement, utiliser le prompt comme localisation
            const apiUrl = `https://date-heure.vercel.app/date?heure=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl);
            const { date_actuelle, heure_actuelle, localisation } = response.data;
            
            // Envoyer la date et l'heure pour la nouvelle localisation
            const reply = `Date actuelle à ${localisation}: ${date_actuelle}\nHeure actuelle: ${heure_actuelle}`;
            await sendMessage(senderId, reply);
            
        } else {
            // Si ni la commande ni la localisation n'ont été envoyées correctement, envoyer un message d'aide
            await sendMessage(senderId, "Pour obtenir la date et l'heure actuelles, envoyez : 'date <localisation>'.");
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Date/Heure:', error);

        // Envoyer un message d'erreur à l'utilisateur
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération de la date et de l'heure.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "date",  // Le nom de la commande
    description: "Permet de connaître la date et l'heure actuelles pour un lieu spécifique.",  // Description de la commande
    usage: "Envoyez 'date <lieu>' pour obtenir la date et l'heure actuelles dans un lieu précis."  // Comment utiliser la commande
};
