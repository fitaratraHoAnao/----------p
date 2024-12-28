const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args, pageAccessToken) => {
    try {
        // Validation des arguments
        if (!args || args.length < 2) {
            await sendMessage(senderId, "❌ Veuillez fournir une question et un UID après la commande `hermes`.");
            return;
        }

        const uid = args.pop(); // Extraire le dernier argument comme UID
        const question = args.join(' '); // Combiner les arguments restants pour former la question
        const apiUrl = `https://api.joshweb.click/ai/hermes-2-pro?q=${encodeURIComponent(question)}&uid=${encodeURIComponent(uid)}`;

        // Nouveau message d'attente
        await sendMessage(senderId, "🤔 Je réfléchis à votre question... Un instant, je prépare une réponse parfaite pour vous ! ✨");

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
    name: "hermes", // Le nom de la commande
    description: "hermes <message> <UID> : Interrogez l'assistant virtuel Hermes-2 Pro pour obtenir des réponses détaillées.", // Description de la commande
    usage: "hermes <message> <UID>", // Comment utiliser la commande
    author: "developer", // Auteur
};
