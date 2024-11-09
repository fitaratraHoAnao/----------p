const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, definition) => {
    try {
        // Confirmer la réception du message de l'utilisateur
        await sendMessage(senderId, "Message reçu, je prépare la définition...");

        // Appeler l'API de définition avec le mot donné par l'utilisateur
        const apiUrl = `https://definition-delta.vercel.app/recherche?definition=${encodeURIComponent(definition)}`;
        const response = await axios.get(apiUrl);

        // Récupérer la réponse complète de l'API
        const reply = response.data.sections.map(section => 
            `${section.titre} ${section.emploi}\n${section.definition}\n${section.exemples.join('\n')}`
        ).join('\n\n');

        // Découper la réponse en morceaux de taille adaptée (environ 10 morceaux)
        const morceaux = reply.match(/[\s\S]{1,2000}/g); // Chaque morceau aura une taille de ~2000 caractères

        // Envoyer chaque morceau avec un délai pour éviter l'envoi en une seule fois
        for (const morceau of morceaux) {
            await sendMessage(senderId, morceau);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1 seconde entre chaque envoi
        }
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API de définition:", error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération de la définition.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "definition",  // Le nom de la commande modifié
    description: "Obtenez la définition complète d'un mot depuis le CNRTL.", // Nouvelle description de la commande
    usage: "Envoyez 'definition <mot>' pour obtenir la définition du mot spécifié."  // Usage mis à jour
};
