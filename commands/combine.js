const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si le mot se termine par -er, -ir, -re, etc. pour savoir s'il s'agit d'un verbe
        const verbeRegex = /er$|ir$|re$|oir$/;

        if (verbeRegex.test(prompt)) {
            // Si c'est un verbe, appeler à la fois l'API de conjugaison et de définition
            const definitionApiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
            const conjugaisonApiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?conjugaison=${encodeURIComponent(prompt)}`;

            // Appeler les deux API simultanément
            const [definitionResponse, conjugaisonResponse] = await Promise.all([
                axios.get(definitionApiUrl),
                axios.get(conjugaisonApiUrl)
            ]);

            // Envoyer la définition
            const definition = definitionResponse.data.response;
            await sendMessage(senderId, definition);

            // Envoyer la conjugaison
            const conjugaison = conjugaisonResponse.data.response;
            await sendMessage(senderId, conjugaison);

        } else {
            // Si ce n'est pas un verbe, utiliser l'API pour la définition uniquement
            const apiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl);

            // Extraire la définition
            const definition = response.data.response;
            await sendMessage(senderId, definition);
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "combine",  // Le nom de la commande
    description: "Permet de rechercher la définition et la conjugaison d'un verbe ou un mot.",  // Nouvelle description
    usage: "Envoyez 'combine <mot>' pour obtenir la définition d'un mot ou la conjugaison d'un verbe."  // Comment utiliser la commande
};
