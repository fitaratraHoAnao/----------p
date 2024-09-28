const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le nom du personnage du texte de l'utilisateur
    const characterName = userText.slice(5).trim(); // Enlever 'waifu ' et enlever les espaces vides

    // Vérifier si le nom est vide
    if (!characterName) {
        await sendMessage(senderId, 'Veuillez fournir un nom de personnage pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, `Message reçu, je prépare les informations sur ${characterName}...`);

        // Appeler l'API Waifu avec le nom fourni
        const apiUrl = `https://waifu-info.vercel.app/kshitiz?name=${encodeURIComponent(characterName)}`;
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse contient les données attendues
        const { name, image, info } = response.data;

        // Attendre 1 seconde avant d'envoyer les informations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Envoyer le nom du personnage à l'utilisateur
        await sendMessage(senderId, `Nom : ${name}`);

        // Attendre 1 seconde avant d'envoyer l'image
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Envoyer l'image du personnage
        await sendMessage(senderId, { files: [image] });

        // Attendre 1 seconde avant d'envoyer les informations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Envoyer les informations du personnage à l'utilisateur
        await sendMessage(senderId, `Info : ${info}`);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Waifu:', error.response ? error.response.data : error.message);

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
