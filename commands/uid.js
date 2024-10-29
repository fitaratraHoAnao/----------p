const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si un URL est fourni dans le prompt
        const params = prompt.split(' ');
        let fbUrl;

        if (params.length > 1) {
            fbUrl = params[1]; // Utiliser l'URL fourni
        } else {
            // Utiliser une URL Facebook par défaut pour cet utilisateur
            fbUrl = `https://www.facebook.com/${senderId}`; // Par exemple, basé sur le senderId
        }

        // Construire l'URL pour l'API de recherche d'UID
        const uidUrl = `https://uid-fb-api.vercel.app/uid?url=${encodeURIComponent(fbUrl)}`;

        // Appeler l'API de recherche d'UID
        const response = await axios.get(uidUrl);

        // Récupérer la réponse
        const reply = response.data;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, JSON.stringify(reply, null, 2));
    } catch (error) {
        console.error('Erreur lors de l'appel à l'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "uid",  // Le nom de la commande
    description: "Obtenez l'ID Facebook de l'utilisateur ou d'une URL fournie.",  // Nouvelle description
    usage: "Envoyez 'uid' pour obtenir votre propre ID, ou 'uid <url_facebook>' pour un autre."  // Nouvelle façon d'utiliser la commande
};
