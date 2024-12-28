const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, args, pageAccessToken) => {
    try {
        // Vérification des arguments
        if (!args || args.length < 5) {
            await sendMessage(senderId, "❌ Veuillez fournir cinq paramètres: [name] [id] [subname] [colorname] [colorsub].");
            return;
        }

        const [name, id, subname, colorname, colorsub] = args;

        // URL de l'API
        const apiUrl = `https://api.joshweb.click/canvas/fbcoverv4?name=${encodeURIComponent(name)}&id=${encodeURIComponent(id)}&subname=${encodeURIComponent(subname)}&colorname=${encodeURIComponent(colorname)}&colorsub=${encodeURIComponent(colorsub)}`;

        // Message de confirmation
        await sendMessage(senderId, "Génération de votre couverture Facebook en cours...");

        // Envoi de l'image générée par l'API
        await sendMessage(senderId, {
            attachment: {
                type: 'image',
                payload: {
                    url: apiUrl,
                },
            },
        });

    } catch (error) {
        console.error('Erreur lors de la génération de l\'image de couverture Facebook:', error);

        // Envoi d'un message d'erreur
        await sendMessage(senderId, "😾 Une erreur s'est produite lors de la génération de l'image de couverture Facebook.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "fbcover4", // Le nom de la commande
    description: "fbcover4 <name> <id> <subname> <colorname> <colorsub>", // Description de la commande
    usage: "fbcover4 <name> <id> <subname> <colorname> <colorsub>", // Comment utiliser la commande
    author: "developer", // Auteur
};
