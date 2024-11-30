const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Gestion des sessions utilisateur
const userSessions = {}; 

module.exports = async (senderId, prompt) => {
    try {
        // Si l'utilisateur envoie "clear", réinitialiser la conversation
        if (prompt.toLowerCase() === 'clear') {
            delete userSessions[senderId]; // Supprimer l'historique de la session
            await sendMessage(senderId, "Vous avez réinitialisé la conversation.");
            return;
        }

        // Vérifier si une session existe pour l'utilisateur, sinon en créer une
        if (!userSessions[senderId]) {
            userSessions[senderId] = { uid: Math.random().toString(36).substring(7) }; // Générer un UID unique
        }

        // Récupérer l'UID de la session
        const uid = userSessions[senderId].uid;

        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "🛠️📡 Calibrage de la réponse… 📡🛠️");

        // Appeler l'API avec le prompt de l'utilisateur et l'UID
        const apiUrl = `https://y2pheq.me/xaoai?prompt=${encodeURIComponent(prompt)}&uid=${uid}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse de l'API
        const reply = response.data.result;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Claude:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "xiao", // Le nom de la commande
    description: "Discutez avec le bot miora, qui mémorise vos échanges.", // Nouvelle description
    usage: "Envoyez 'xiao <message>' pour poser une question ou 'clear' pour réinitialiser la conversation." // Nouvelle utilisation
};

