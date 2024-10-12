const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Découper le prompt pour extraire la langue et le texte à traduire
        const promptParts = prompt.split(' ');
        const language = promptParts[0];  // Première partie du message, ex: 'fr'
        const textToTranslate = promptParts.slice(1).join(' ');  // Le reste est le texte à traduire

        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, `Message reçu, je prépare une traduction en ${language}...`);

        // Appeler l'API Lingvanex avec le texte et la langue cible de l'utilisateur
        const apiUrl = `https://lingvanex-two.vercel.app/lingvanex`;
        const payload = {
            text: textToTranslate,  // Le texte que l'utilisateur a fourni
            to: language            // La langue cible, ex: 'fr_FR'
        };

        // Effectuer la requête POST vers votre API Lingvanex
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Récupérer la bonne clé dans la réponse de l'API
        const reply = response.data.result;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Lingvanex:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "lingvanex",  // Le nom de la commande est maintenant "lingvanex"
    description: "Permet de traduire du texte dans différentes langues en utilisant Lingvanex.",  // Description de la commande
    usage: "Envoyez 'lingvanex <langue> <message>' pour traduire un texte."  // Comment utiliser la commande
};
