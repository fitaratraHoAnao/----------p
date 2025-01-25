const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => { 
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "✨📨 Votre question est en route vers l'intelligence suprême... Merci de patienter ! 🤖💡");

        // Construire l'URL de l'API pour résoudre la question
        const apiUrl = `https://api.zetsu.xyz/api/mixtral-8b?q=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la bonne clé dans la réponse de l'API
        const reply = response.data.result;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "chat",  // Le nom de la commande
    description: "Pose ta question et obtiens une réponse intelligente de l'IA.",  // Description de la commande
    usage: "Envoyez 'chat <question>' pour poser une question à l'IA."  // Comment utiliser la commande
};
    
