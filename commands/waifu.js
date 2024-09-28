const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom du personnage en retirant le préfixe 'waifu ' et en supprimant les espaces superflus
    const characterName = userText.slice(6).trim(); // On suppose que l'utilisateur utilise le préfixe 'waifu '

    // Vérifier si le nom est vide
    if (!characterName) {
        await sendMessage(senderId, 'Veuillez fournir un nom de personnage à rechercher.');
        return;
    }

    try {
        // Appeler l'API pour obtenir les informations du personnage
        const apiUrl = `https://waifu-info.vercel.app/kshitiz?name=${encodeURIComponent(characterName)}`;
        const response = await axios.get(apiUrl);
        
        // Vérifier si des données ont été retournées
        if (response.data && response.data.name) {
            const { name, image, info } = response.data;

            // Préparer le message à envoyer à l'utilisateur
            const messageContent = `**Nom**: ${name}\n\n**Info**: ${info}\n\n**Image**: ${image}`;
            await sendMessage(senderId, messageContent); // Envoyer les informations au format texte
            await sendMessage(senderId, { files: [image] }); // Envoyer l'image en tant que fichier
        } else {
            await sendMessage(senderId, 'Désolé, aucun personnage trouvé avec ce nom.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Waifu:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des informations.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "waifu",  // Le nom de la commande
    description: "Obtenez des informations sur un personnage waifu en envoyant 'waifu <nom>'.",  // Description de la commande
    usage: "Envoyez 'waifu <nom>' pour obtenir les informations d'un personnage waifu."  // Comment utiliser la commande
};
