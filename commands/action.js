const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API Wikidata pour obtenir des informations sur le terme recherché
        const apiUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(prompt)}&language=fr&format=json`;
        const response = await axios.get(apiUrl);

        // Vérifier si des résultats ont été trouvés
        let reply;
        if (response.data.search && response.data.search.length > 0) {
            // Récupérer les résultats pertinents
            const results = response.data.search.map(result => {
                return {
                    label: result.label,
                    description: result.description || "Aucune description disponible",
                    url: `https://www.wikidata.org/wiki/${result.id}`
                };
            });

            // Créer une réponse formatée
            reply = `Voici ce que j'ai trouvé pour "${prompt}":\n\n`;
            results.forEach(result => {
                reply += `- **${result.label}**: ${result.description}\n  [Voir plus](${result.url})\n`;
            });
        } else {
            reply = `Désolé, je n'ai trouvé aucune information pour "${prompt}".`;
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
    name: "action",  // Le nom de la commande
    description: "Permet d'effectuer une action avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'action <message>' pour poser une question ou démarrer une action."  // Comment utiliser la commande
};
