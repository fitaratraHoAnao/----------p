const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt, uid = '123') => { // UID ajouté comme paramètre optionnel
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Construire l'URL de l'API avec le texte encodé
        const apiUrl = `https://kaiz-apis.gleeze.com/api/paraphrase?text=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la bonne clé dans la réponse de l'API
        const reply = response.data.response;

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
    name: "paraphrase",  // Le nom de la commande
    description: "Permet de discuter avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'paraphrase <message>' pour poser une question ou démarrer une conversation."  // Comment utiliser la commande
};
