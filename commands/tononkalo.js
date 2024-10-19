const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Extraire les paramètres pour l'API
        const params = prompt.split(' ');
        const tononkalo = params[0]; // Le premier mot après la commande sera le tononkalo
        const page = params[1] || 1; // Le deuxième mot, ou 1 par défaut

        // Construire les URLs pour les API
        const rechercheUrl = `https://manoratra-liste-tononkalo.vercel.app/recherche?tononkalo=${encodeURIComponent(tononkalo)}&page=${encodeURIComponent(page)}`;
        const rechercheAuteurUrl = `https://manoratra-liste-tononkalo.vercel.app/recherche_auteur?auteur=${encodeURIComponent(tononkalo)}&titre=HIANOKA`; // Exemple titre
        const auteurUrl = `https://manoratra-liste-tononkalo.vercel.app/auteur?query=mpanoratra&page=${encodeURIComponent(page)}`;
        const recherchePoemeUrl = `https://manoratra-liste-tononkalo.vercel.app/recherche_poeme?poeme=${encodeURIComponent(tononkalo)}&page=${encodeURIComponent(page)}`;

        // Appel aux différentes API (vous pouvez choisir celle que vous souhaitez)
        // Exemple: appeler l'API de recherche de tononkalo
        const response = await axios.get(rechercheUrl);

        // Récupérer la réponse
        const reply = response.data;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de l'API à l'utilisateur
        await sendMessage(senderId, JSON.stringify(reply, null, 2));
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tononkalo",  // Le nom de la commande
    description: "Recherchez des poèmes par tononkalo et pagination.",  // Nouvelle description
    usage: "Envoyez 'tononkalo <nom> <page>' pour rechercher des poèmes."  // Nouvelle façon d'utiliser la commande
};
