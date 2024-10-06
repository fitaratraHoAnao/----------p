const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Construire l'URL de l'API avec les paramètres corrects
        const apiUrl = `https://deku-rest-api.gleeze.com/ai/discolm-german?q=${encodeURIComponent(prompt)}&uid=${encodeURIComponent(senderId)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la bonne clé dans la réponse de l'API
        const reply = response.data.result;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "german",  // Le nouveau nom de la commande
    description: "Permet de discuter avec le modèle DiscoLM German.",  // Description de la commande
    usage: "Envoyez 'german <message>' pour poser une question ou démarrer une conversation en allemand."  // Comment utiliser la commande
};
