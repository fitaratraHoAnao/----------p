const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args) => {
    try {
        // Vérifier si l'utilisateur a fourni un prompt
        if (!args[0]) {
            return sendMessage(senderId, "Veuillez fournir un prompt pour Llama.");
        }

        // Préparer le prompt pour l'API
        const prompt = encodeURIComponent(args.join(" "));
        const apiUrl = `https://create-by-bruno.vercel.app/?ask=${prompt}`;

        // Appeler l'API
        const response = await axios.get(apiUrl);

        // Vérifier la réponse de l'API
        if (response.data && response.data.response) {
            await sendMessage(senderId, response.data.response);
        } else {
            await sendMessage(senderId, "Impossible d'obtenir une réponse de Mistral.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API gemma7:', error.message);
        await sendMessage(senderId, "Une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "gemma7",  // Le nom de la commande
    description: "Interroge l'API Llama pour obtenir une réponse.",  // Description de la commande
    usage: "Envoyez 'gemma7 <votre prompt>' pour obtenir une réponse."  // Comment utiliser la commande
};
