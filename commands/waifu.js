const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom du personnage
    const characterName = userText.trim();

    // Vérifier si le nom du personnage est vide
    if (!characterName) {
        await sendMessage(senderId, 'Veuillez fournir le nom d\'un personnage pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API Waifu avec le nom du personnage fourni
        const apiUrl = `https://waifu-info.vercel.app/kshitiz?name=${encodeURIComponent(characterName)}`;
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse de l'API est valide
        if (response && response.data) {
            const { name, image, info } = response.data;

            // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer le nom et l'info en texte
            const replyText = `**Nom :** ${name}\n**Info :** ${info}`;
            await sendMessage(senderId, replyText);

            // Envoyer l'image directement
            await sendMessage(senderId, {
                attachment: {
                    type: 'image',
                    payload: {
                        url: image,
                        is_reusable: true
                    }
                }
            });
        } else {
            console.error('Aucune donnée reçue de l\'API:', response);
            await sendMessage(senderId, 'Désolé, aucune information disponible pour ce personnage.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Waifu:', error);
        
        // Détails supplémentaires pour le débogage
        if (error.response) {
            console.error('Détails de la réponse d\'erreur:', error.response.data);
        }

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre demande.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "waifu",  // Le nom de la commande
    description: "Envoyez le nom d'un personnage pour obtenir des informations et une image à son sujet.",  // Description de la commande
    usage: "Envoyez '<nom du personnage>' pour obtenir des informations."  // Comment utiliser la commande
};
