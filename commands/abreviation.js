const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Fonction pour envoyer les abréviations en morceaux
const sendAbbreviationsInChunks = async (senderId, abbreviations) => {
    const chunkSize = 10; // Taille du morceau
    for (let i = 0; i < abbreviations.length; i += chunkSize) {
        const chunk = abbreviations.slice(i, i + chunkSize);
        const message = chunk.map(abbr => `${abbr.abreviation}: ${abbr.definition}`).join('\n');
        
        // Envoyer le morceau au bot
        await sendMessage(senderId, message);

        // Attendre 2 secondes avant d'envoyer le prochain morceau
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
};

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Si l'utilisateur demande "liste", appeler l'API des abréviations
        if (prompt.toLowerCase() === 'liste') {
            const apiUrl = 'https://abrviation.vercel.app/recherche?abreviation=liste';
            const response = await axios.get(apiUrl);
            const abbreviations = response.data;

            // Envoyer les abréviations en morceaux
            await sendAbbreviationsInChunks(senderId, abbreviations);
            return; // Sortir de la fonction après avoir traité la liste
        }

        // Appeler l'API pour une abréviation spécifique
        const apiUrl = `https://abrviation.vercel.app/recherche?query=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        const reply = response.data;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, `${reply.abreviation}: ${reply.definition}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "chat",  // Le nom de la commande
    description: "Permet de discuter avec le ✨ Bot.",  // Description de la commande
    usage: "Envoyez 'chat <message>' pour poser une question ou démarrer une conversation."  // Comment utiliser la commande
};
