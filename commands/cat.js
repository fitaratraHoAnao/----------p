const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Vérifier si le texte de l'utilisateur commence par "cat"
    if (!userText.startsWith("cat")) {
        await sendMessage(senderId, 'Veuillez utiliser le format "cat" pour demander une image de chat.');
        return;
    }

    // Envoyer un message de confirmation que la requête est en cours de traitement
    await sendMessage(senderId, "Message reçu, je prépare une image de chat...");

    try {
        // Appeler l'API The Cat API pour obtenir une image de chat
        const apiUrl = 'https://api.thecatapi.com/v1/images/search';
        const response = await axios.get(apiUrl);

        // Récupérer l'URL de l'image de chat
        const catImageUrl = response.data[0].url;

        // Attendre 2 secondes avant d'envoyer l'image pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer l'image de chat à l'utilisateur
        await sendMessage(senderId, { files: [catImageUrl] });
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API The Cat API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération de l\'image de chat.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "cat",  // Le nom de la commande
    description: "Demandez une image de chat en envoyant 'cat'.",  // Description de la commande
    usage: "Envoyez 'cat' pour obtenir une image de chat."  // Comment utiliser la commande
};
