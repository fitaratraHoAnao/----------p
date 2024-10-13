const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Utiliser le prompt comme verbe pour l'API de conjugaison
        const apiUrl = `https://conjugaison-livid.vercel.app/conjugaison?verbe=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API de conjugaison
        const reply = JSON.stringify(response.data, null, 2); // Format JSON pour une réponse lisible

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de conjugaison:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "conjugaison",  // Le nom de la commande modifié
    description: "Permet de conjuguer des verbes.",  // Description de la commande modifiée
    usage: "Envoyez 'conjugaison <verbe>' pour obtenir la conjugaison du verbe."  // Comment utiliser la commande modifiée
};
