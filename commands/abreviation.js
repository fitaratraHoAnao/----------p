const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si le prompt est pour une recherche d'abréviation spécifique
        let apiUrl;
        if (prompt.startsWith("abreviation ")) {
            const query = prompt.split(" ")[1]; // Extraire l'abréviation de la commande
            apiUrl = `https://abrviation.vercel.app/recherche?query=${encodeURIComponent(query)}`;
        } else {
            // Si aucune abréviation spécifique n'est fournie, appeler l'API pour toutes les abréviations
            apiUrl = `https://abrviation.vercel.app/recherche?abreviation=liste`;
        }

        const response = await axios.get(apiUrl);
        let reply;

        // Vérifier le format de la réponse et formater la réponse
        if (Array.isArray(response.data)) {
            // Réponse pour la liste d'abréviations
            reply = response.data.map(item => `${item.abreviation}: ${item.definition}`).join('\n');
        } else {
            // Réponse pour une abréviation spécifique
            reply = `${response.data.abreviation}: ${response.data.definition}`;
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API d\'abréviations:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "abreviation",  // Le nom de la commande
    description: "Recherche une abréviation ou affiche toutes les abréviations disponibles.",  // Description de la commande
    usage: "Envoyez 'abreviation <abréviation>' pour rechercher une abréviation spécifique ou 'abreviation' pour voir toutes les abréviations."  // Comment utiliser la commande
};
