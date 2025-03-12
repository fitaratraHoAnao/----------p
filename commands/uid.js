const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId) => { 
    try {
        // Envoyer un message d'attente
        await sendMessage(senderId, "🔍 Récupération de ton UID Facebook... ⏳");

        // Construire l'URL de l'API avec l'URL du profil de l'utilisateur
        const fbProfileUrl = `https://www.facebook.com/${senderId}`;
        const apiUrl = `https://kaiz-apis.gleeze.com/api/fbuid?url=${encodeURIComponent(fbProfileUrl)}`;

        console.log(`Appel API avec l'URL: ${apiUrl}`);

        // Appel de l'API
        const response = await axios.get(apiUrl);
        const uid = response.data.UID;

        // Envoyer l'UID récupéré à l'utilisateur
        await sendMessage(senderId, `🆔 Ton UID Facebook : ${uid}`);

    } catch (error) {
        console.error('Erreur lors de la récupération de l\'UID:', error);

        // Envoyer un message d'erreur à l'utilisateur
        await sendMessage(senderId, "🚨 Oups ! Impossible de récupérer ton UID Facebook.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "uid",  // Nom de la commande
    description: "Récupère l'UID Facebook de ton compte.",  // Description
    usage: "Envoyez 'uid' pour obtenir votre UID Facebook."  // Comment utiliser la commande
};
