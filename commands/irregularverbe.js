const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Définir la base URL de l'API Flask déployée
        const baseUrl = 'https://verbe-irregulier.onrender.com';

        let apiUrl;

        // Condition pour déterminer quelle route de l'API utiliser en fonction du prompt
        if (prompt.startsWith('recherche')) {
            const category = prompt.split(' ')[1] || 'infinitif'; // Extraire la catégorie de la recherche
            apiUrl = `${baseUrl}/recherche?categorie=${encodeURIComponent(category)}`;
        } else if (prompt.startsWith('dynamique')) {
            const query = prompt.split(' ')[1]; // Extraire le verbe ou la requête
            apiUrl = `${baseUrl}/dynamique?q=${encodeURIComponent(query)}`;
        } else {
            // Par défaut, récupérer tous les verbes irréguliers
            apiUrl = `${baseUrl}/verbe_irregulier`;
        }

        // Appeler l'API Flask avec l'URL générée
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API Flask
        const reply = JSON.stringify(response.data, null, 2); // Formatage pour une réponse lisible

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Flask:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "irregularverbe",  // Le nouveau nom de la commande
    description: "Permet d'accéder aux informations sur les verbes irréguliers.",  // Description de la commande
    usage: "Envoyez 'recherche <catégorie>' ou 'dynamique <verbe>' pour chercher des informations sur un verbe."  // Comment utiliser la commande
};
