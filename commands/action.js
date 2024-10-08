const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API Wikidata pour obtenir des informations sur "chat"
        const apiUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(prompt)}&language=fr&format=json`;
        const response = await axios.get(apiUrl);

        // Vérifier si des résultats ont été trouvés
        if (response.data.search.length > 0) {
            // Récupérer la première réponse pertinente
            const result = response.data.search[0];
            const reply = `Voici ce que j'ai trouvé pour "${result.label}": ${result.description}. Vous pouvez en savoir plus ici: ${result.url}`;
        } else {
            const reply = `Désolé, je n'ai trouvé aucune information pour "${prompt}".`;
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Wikidata:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "action",  // Le nom de la commande modifié
    description: "Permet d'effectuer une action avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'action <message>' pour poser une question ou démarrer une action."  // Comment utiliser la commande
};
