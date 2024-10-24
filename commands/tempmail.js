const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker le dernier email généré pour chaque utilisateur
const lastGeneratedEmails = {};

module.exports = async (senderId, prompt) => {
    try {
        // Si l'utilisateur envoie "tempmail mail" la première fois
        if (prompt.toLowerCase() === 'tempmail mail') {
            // Appeler l'API pour générer un email temporaire
            const apiUrl = `https://tempmail-api-blush.vercel.app/generate?tempmail=mail`;
            const response = await axios.get(apiUrl);

            // Récupérer le mail généré
            const tempMail = response.data.tempmail;

            // Sauvegarder le mail généré pour cet utilisateur
            lastGeneratedEmails[senderId] = tempMail;

            // Envoyer le mail généré à l'utilisateur
            await sendMessage(senderId, `Voici votre email temporaire : ${tempMail}`);
        
        // Si l'utilisateur envoie simplement "mail"
        } else if (prompt.toLowerCase() === 'mail') {
            // Générer un nouveau mail temporaire
            const apiUrl = `https://tempmail-api-blush.vercel.app/generate?tempmail=mail`;
            const response = await axios.get(apiUrl);

            // Récupérer le mail généré
            const newMail = response.data.tempmail;

            // Sauvegarder le nouveau mail pour cet utilisateur
            lastGeneratedEmails[senderId] = newMail;

            // Envoyer le nouveau mail généré à l'utilisateur
            await sendMessage(senderId, `Voici votre email temporaire : ${newMail}`);

        // Si l'utilisateur envoie un email temporaire, on vérifie sa boîte de réception
        } else if (prompt.includes('@')) {
            // Vérifier si l'email existe dans les mails générés pour cet utilisateur
            if (lastGeneratedEmails[senderId] && lastGeneratedEmails[senderId] === prompt) {
                // Appeler l'API pour vérifier la boîte de réception
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
                await sendMessage(senderId, "Cet email n'a pas été généré par moi ou n'existe pas.");
            }
        } else {
            // Envoyer un message d'erreur si la commande n'est pas reconnue
            await sendMessage(senderId, "Commande non reconnue. Envoyez 'tempmail mail' pour générer un email temporaire ou 'mail' pour générer un nouveau.");
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
    usage: "Envoyez 'tempmail mail' pour générer un email temporaire, ou 'mail' pour générer un nouvel email."  // Comment utiliser la commande
};
