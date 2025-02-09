const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Sessions utilisateurs pour stocker les emails temporaires
const userSessions = {};

module.exports = async (senderId, prompt) => {
    try {
        // Vérifie si l'utilisateur a déjà une session active
        if (userSessions[senderId] && userSessions[senderId].email && prompt === userSessions[senderId].email) {
            // Si l'utilisateur envoie l'email temporaire généré, récupérer les messages
            const inboxUrl = `https://xnil.xnil.unaux.com/xnil/tminbox?mail=${userSessions[senderId].email}`;
            const inboxResponse = await axios.get(inboxUrl);
            const inboxData = inboxResponse.data.data;

            // Construire une réponse utilisateur à partir de la boîte de réception
            let inboxMessages = "";
            if (inboxData && inboxData.body_text) {
                inboxMessages = `Expéditeur : ${inboxData.from}\nSujet : ${inboxData.subject}\nMessage :\n${inboxData.body_text}`;
            } else {
                inboxMessages = "Aucun message reçu pour le moment.";
            }

            // Envoyer les messages reçus à l'utilisateur
            await sendMessage(senderId, `Messages reçus :\n${inboxMessages}`);

            // Supprime la session utilisateur après réponse
            delete userSessions[senderId];
        } else {
            // Génération d'un nouvel email temporaire
            const createMailUrl = 'https://xnil.xnil.unaux.com/xnil/tmgen';
            const createResponse = await axios.get(createMailUrl);
            const emailData = createResponse.data.data;

            // Sauvegarder l'email temporaire dans la session utilisateur
            userSessions[senderId] = { email: emailData.email };

            // Envoyer l'email temporaire généré à l'utilisateur
            await sendMessage(senderId, emailData.email);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API TempMail :', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tempmail",  // Le nom de la commande
    description: "Génère une adresse email temporaire et affiche les emails reçus après saisie de l'email.",  // Description de la commande
    usage: "Envoyez 'tempmail' pour obtenir une adresse email temporaire. Envoyez ensuite l'email généré pour consulter les messages."  // Comment utiliser la commande
};
