const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args, pageAccessToken) => {
    try {
        // Validation des arguments
        if (!args || args.length === 0) {
            await sendMessage(senderId, "❌ Veuillez fournir une question après la commande `liner`.");
            return;
        }

        const question = args.join(' '); // Combiner les arguments pour former la question
        const apiUrl = `https://api.joshweb.click/api/liner?q=${encodeURIComponent(question)}`;

        // Nouveau message d'attente
        await sendMessage(senderId, "✨ Patientez un instant, je réfléchis pour vous répondre... ✨");

        // Appel à l'API
        const response = await axios.get(apiUrl);

        if (response.data && response.data.status && response.data.result) {
            const reply = response.data.result;

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer la réponse de l'API
            await sendMessage(senderId, reply);
        } else {
            throw new Error("La réponse de l'API est invalide.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoi d'un message d'erreur
        await sendMessage(senderId, "😾 Une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "liner", // Le nom de la commande
    description: "liner <message> : Permet de poser une question ou d'obtenir des informations détaillées grâce à l'assistant Liner.", // Description de la commande
    usage: "liner <message>", // Comment utiliser la commande
    author: "developer", // Auteur
};
