const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API
const BASE_API_URL = 'https://joshweb.click/ai/phi-2';

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'phi' et en supprimant les espaces superflus
    const prompt = userText.slice(3).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "💭📡 Connexion au flux d’informations… 📡💭");

        // Construire l'URL d'appel à l'API
        const apiUrl = `${BASE_API_URL}?q=${encodeURIComponent(prompt)}&uid=${senderId}`;
        console.log('URL appelée :', apiUrl);

        // Appeler l'API
        const response = await axios.get(apiUrl);
        console.log('Réponse complète de l\'API :', response.data);

        // Extraire le résultat de la réponse
        const reply = response.data.result;

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error.response?.data || error.message);

        // Envoyer un message d'erreur à l'utilisateur
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "phi", // Le nouveau nom de la commande
    description: "Posez une question ou donnez un sujet, et recevez une réponse générée par l'IA.", // Nouvelle description
    usage: "Envoyez 'phi <votre question>' pour obtenir une réponse." // Nouveau mode d'emploi
};

          
