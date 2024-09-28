const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom du personnage en retirant le préfixe 'waifu' et en supprimant les espaces superflus
    const characterName = userText.slice(6).trim();

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

        // Récupérer les données de la réponse de l'API
        const { name, image, info } = response.data;

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Construire le message de réponse avec l'image et l'info
        const reply = `**Nom :** ${name}\n**Info :** ${info}`;
        
        // Envoyer les informations textuelles à l'utilisateur
        await sendMessage(senderId, reply);
        
        // Envoyer l'image à l'utilisateur
        await sendMessage(senderId, { files: [image] });  // Si sendMessage gère les fichiers
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Waifu:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre demande.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "waifu",  // Le nom de la commande
    description: "Envoyez le nom d'un personnage pour obtenir des informations et une image à son sujet.",  // Description de la commande
    usage: "Envoyez 'waifu <nom du personnage>' pour obtenir des informations."  // Comment utiliser la commande
};
