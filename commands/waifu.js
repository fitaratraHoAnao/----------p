const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom du personnage en retirant le préfixe 'waifu ' et en supprimant les espaces superflus
    const characterName = userText.slice(6).trim(); // "waifu " a 6 caractères

    // Vérifier si le nom du personnage est vide
    if (!characterName) {
        await sendMessage(senderId, 'Veuillez fournir un nom de personnage.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, `Message reçu, je prépare les informations sur ${characterName}...`);

        // Appeler l'API avec le nom du personnage fourni
        const apiUrl = `https://waifu-info.vercel.app/kshitiz?name=${encodeURIComponent(characterName)}`;
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse contient les informations nécessaires
        if (response.data) {
            const { name, image, info } = response.data; // Récupérer les données

            // Envoyer le nom du personnage
            await sendMessage(senderId, `Nom : ${name}`);

            // Attendre 1 seconde avant d'envoyer l'image pour un délai naturel
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Envoyer l'image
            await sendMessage(senderId, { files: [image] });

            // Attendre 1 seconde avant d'envoyer les informations supplémentaires
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Envoyer les informations supplémentaires
            await sendMessage(senderId, `Info : ${info}`);
        } else {
            await sendMessage(senderId, 'Désolé, aucune information trouvée pour ce personnage.');
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Waifu:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la récupération des informations.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "waifu",  // Le nom de la commande
    description: "Obtenez des informations sur un personnage waifu.",  // Description de la commande
    usage: "Envoyez 'waifu <nom du personnage>' pour obtenir des informations."  // Comment utiliser la commande
};
