const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt, uid = '123') => { // UID ajouté comme paramètre optionnel
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // API pour créer une adresse email temporaire
        const createMailUrl = 'https://xnil.xnil.unaux.com/xnil/tmgen';
        const createResponse = await axios.get(createMailUrl);
        const emailData = createResponse.data.data; // Récupération de la réponse "data"

        // Extraire l'adresse email et le token
        const email = emailData.email;
        const token = emailData.token;

        // Attendre 2 secondes pour éviter d'éventuels délais API
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Construire l'URL de l'API pour récupérer la boîte de réception
        const inboxUrl = `https://xnil.xnil.unaux.com/xnil/tminbox?mail=${email}`;
        const inboxResponse = await axios.get(inboxUrl);
        const inboxData = inboxResponse.data.data; // Récupération de la réponse "data"

        // Construire une réponse utilisateur à partir de la boîte de réception
        let inboxMessages = "";
        if (inboxData && inboxData.body_text) {
            inboxMessages = `Expéditeur: ${inboxData.from}\nSujet: ${inboxData.subject}\nMessage: ${inboxData.body_text}`;
        } else {
            inboxMessages = "Aucun message reçu pour le moment.";
        }

        // Envoyer l'adresse email temporaire et les messages de l'inbox à l'utilisateur
        await sendMessage(senderId, `Adresse temporaire: ${email}\n\nMessages reçus:\n${inboxMessages}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API TempMail:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tempmail",  // Le nom de la commande
    description: "Génère une adresse email temporaire et affiche les emails reçus.",  // Description de la commande
    usage: "Envoyez 'tempmail' pour obtenir une adresse email temporaire et consulter les messages."  // Comment utiliser la commande
};
