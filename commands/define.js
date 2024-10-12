const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Découper le prompt pour extraire le mot à définir
        const word = prompt.trim();  // Supposons que l'utilisateur envoie simplement le mot

        // Envoyer un message de confirmation que le mot a été reçu
        await sendMessage(senderId, `Recherche des définitions pour le mot "${word}"...`);

        // Appeler l'API de définition
        const apiUrl = `https://plus-definition.vercel.app/define/${word}`;  // URL de l'API
        const response = await axios.get(apiUrl);

        // Récupérer les définitions dans la réponse de l'API
        const definitions = response.data.definitions;

        // Vérifier si des définitions sont disponibles
        if (definitions && definitions.length > 0) {
            // Formater les définitions pour l'envoi
            const reply = `Définitions pour le mot "${word}":\n` +
                definitions.map((def, index) => `${index + 1}: ${def}`).join('\n');
            
            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer les définitions à l'utilisateur
            await sendMessage(senderId, reply);
        } else {
            await sendMessage(senderId, `Aucune définition trouvée pour le mot "${word}".`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de définition:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "define",  // Le nom de la commande est "define"
    description: "Obtenez les définitions d'un mot.",  // Description de la commande
    usage: "Envoyez 'define <mot>' pour obtenir les définitions."  // Comment utiliser la commande
};
