const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API des synonymes avec le mot de l'utilisateur
        const apiUrl = `https://synonymes.vercel.app/recherche?synonyme=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la bonne clé dans la réponse de l'API
        const reply = response.data.synonymes.join(", ");

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, `Synonymes de "${response.data.synonyme}" : ${reply}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API des synonymes:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "synonyme",  // Le nom de la commande
    description: "Permet de rechercher des synonymes pour un mot.",  // Description de la commande
    usage: "Envoyez 'synonyme <mot>' pour obtenir des synonymes."  // Comment utiliser la commande
};
