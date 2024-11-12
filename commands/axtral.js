const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "🎩✨ Un peu de magie en préparation… ✨🎩");

        // Appeler l'API avec le prompt de l'utilisateur
        const apiUrl = `https://api.kenliejugarap.com/prefind/?question=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse et la diviser en morceaux si elle est trop longue
        const fullReply = response.data.response; // Réponse complète de l'API
        const chunkSize = 2000; // Taille maximum de chaque message (par exemple, 2000 caractères)
        const chunks = [];

        // Diviser le texte en morceaux
        for (let i = 0; i < fullReply.length; i += chunkSize) {
            chunks.push(fullReply.slice(i, i + chunkSize));
        }

        // Envoyer chaque morceau avec un délai
        for (const chunk of chunks) {
            await sendMessage(senderId, chunk);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Délai de 1 seconde entre les envois
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "axtral",  // Le nom de la commande
    description: "Permet de discuter avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'axtral <message>' pour poser une question ou démarrer une conversation."  // Comment utiliser la commande
};

