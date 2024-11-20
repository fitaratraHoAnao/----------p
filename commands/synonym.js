const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "🕰️🌍 Chargement de l’inspiration… 🌍🕰️");

        // Construire l'URL de l'API avec le mot clé utilisateur
        const apiUrl = `https://synonymes-francais.vercel.app/recherche?synonyme=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse contient des synonymes
        const synonymes = response.data.synonymes;
        if (!synonymes || synonymes.length === 0) {
            await sendMessage(senderId, `Aucun synonyme trouvé pour "${prompt}".`);
            return;
        }

        // Construire la réponse avec les synonymes trouvés
        const reply = `Voici les synonymes de "${prompt}":\n` + synonymes.join(', ');

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse des synonymes à l'utilisateur
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API des synonymes:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche des synonymes.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "synonym", // Nouveau nom de la commande
    description: "Recherchez les synonymes d'un mot en français.", // Nouvelle description
    usage: "Envoyez 'synonym <mot>' pour obtenir la liste des synonymes." // Nouvel usage
};

