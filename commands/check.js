const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une correction...");

        // Appeler l'API de correction orthographique avec le message de l'utilisateur
        const apiUrl = `https://check-ortho-francais.vercel.app/check`;
        const response = await axios.post(apiUrl, {
            text: prompt,      // Texte à corriger
            language: 'fr'     // Langue pour la correction (ici français)
        });

        // Récupérer les corrections dans la réponse de l'API
        const corrections = response.data.corrections;

        // Construire la réponse avec les messages et suggestions
        let reply = '';
        if (corrections.length > 0) {
            reply = 'Voici les suggestions de correction :\n';
            corrections.forEach((correction, index) => {
                reply += `${index + 1}. ${correction.message}\nSuggestions : ${correction.suggestions.join(', ')}\n\n`;
            });
        } else {
            reply = 'Aucune faute trouvée dans votre message.';
        }

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de correction à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de correction:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "check",  // Le nom de la commande pour la correction orthographique
    description: "Permet de corriger les fautes d'orthographe dans un message.",  // Description de la commande
    usage: "Envoyez 'check <message>' pour vérifier et corriger les fautes d'orthographe."  // Comment utiliser la commande
};
