const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args, pageAccessToken) => {
    try {
        // Validation des arguments
        if (!args || args.length === 0) {
            await sendMessage(senderId, "❌ Veuillez fournir un texte à partager avec la commande `share`.");
            return;
        }

        const text = args.join(' '); // Combiner les arguments pour former le texte
        const apiUrl = `https://api-canvass.vercel.app/share?text=${encodeURIComponent(text)}`;

        // Nouveau message d'attente
        await sendMessage(senderId, "📤 Préparation de votre image à partager... Un instant, s'il vous plaît ! ✨");

        // Appel à l'API
        const response = await axios.get(apiUrl);

        if (response.data && response.data.url) {
            // Envoyer l'image générée en pièce jointe
            await sendMessage(senderId, { 
                attachment: { 
                    type: 'image', 
                    payload: { url: response.data.url } 
                } 
            }, pageAccessToken);
        } else {
            throw new Error("La réponse de l'API est invalide ou ne contient pas d'URL.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoi d'un message d'erreur
        await sendMessage(senderId, "😾 Une erreur s'est produite lors de la génération de l'image à partager.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "share", // Le nom de la commande
    description: "share <text> : Génère une image prête à être partagée avec le texte fourni.", // Description de la commande
    usage: "share <text>", // Comment utiliser la commande
    author: "developer", // Auteur
};
