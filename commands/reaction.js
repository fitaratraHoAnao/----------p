module.exports = async ({ api, event }) => {
    try {
        // Récupérer l'ID du message envoyé par l'utilisateur
        const messageId = event.messageID;
        const senderId = event.senderID;
        const messageText = event.body;

        // Si un message est reçu, réagir automatiquement avec une réaction (ici "✅")
        if (messageText) {
            await api.setMessageReaction("✅", messageId, true); // Réagir au message avec l'emoji ✅
        }

        // (Optionnel) Vous pouvez aussi envoyer un message de confirmation si nécessaire
        // await api.sendMessage(`Réaction ajoutée à votre message : ${messageText}`, event.threadID, messageId);

    } catch (error) {
        console.error('Erreur lors de la réaction automatique:', error);

        // En cas d'erreur, envoyer un message d'erreur
        await api.sendMessage("Désolé, une erreur s'est produite lors de la réaction automatique.", event.threadID);
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "reaction",  // Le nom de la commande
    description: "Réagir automatiquement à chaque message avec une réaction.",  // Description de la commande
    usage: "Envoyez n'importe quel message pour recevoir une réaction automatique (ex : ✅)."  // Comment utiliser la commande
};
