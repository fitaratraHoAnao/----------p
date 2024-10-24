const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Si l'utilisateur envoie simplement "mail", on génère un mail temporaire
        if (prompt.toLowerCase() === 'mail') {
            // Appeler l'API pour générer un email temporaire
            const apiUrl = `https://tempmail-api-blush.vercel.app/generate?tempmail=mail`;
            const response = await axios.get(apiUrl);

            // Récupérer le mail généré
            const tempMail = response.data.tempmail;

            // Envoyer le mail généré à l'utilisateur
            await sendMessage(senderId, `Voici votre email temporaire : ${tempMail}`);
        
        } else if (prompt.includes('@')) {
            // Si l'utilisateur envoie un email, on vérifie sa boîte de réception
            const inboxUrl = `https://tempmail-api-blush.vercel.app/check?inbox=${encodeURIComponent(prompt)}`;
            const inboxResponse = await axios.get(inboxUrl);

            // Récupérer la liste des emails dans la boîte de réception
            const inbox = inboxResponse.data.inbox;

            if (inbox.length === 0) {
                await sendMessage(senderId, "Votre boîte de réception est vide pour l'instant.");
            } else {
                // Formater les emails pour un affichage clair
                let message = "Voici les emails reçus :\n";
                inbox.forEach((email, index) => {
                    message += `\nEmail ${index + 1}:\n- De: ${email.from}\n- Sujet: ${email.subject}\n- Date: ${email.date}\n`;
                });
                await sendMessage(senderId, message);
            }
        } else {
            // Envoyer un message d'erreur si la commande n'est pas reconnue
            await sendMessage(senderId, "Commande non reconnue. Envoyez 'mail' pour générer un email temporaire ou entrez un email pour vérifier sa boîte de réception.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel aux API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tempmail",  // Le nom de la commande
    description: "Génère un email temporaire et vérifie sa boîte de réception.",  // Description de la commande
    usage: "Envoyez 'mail' pour générer un email temporaire ou entrez l'email généré pour vérifier sa boîte de réception."  // Comment utiliser la commande
};
