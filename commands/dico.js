const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur a demandé le dictionnaire
        if (prompt.toLowerCase() === 'dico') {
            await sendMessage(senderId, "Vous avez autorisé à utiliser le dictionnaire. Veuillez entrer une lettre (A-Z).");
            return;
        }

        // Vérifier si l'utilisateur a entré une lettre
        const letterMatch = prompt.match(/^([A-Z])$/i);
        if (letterMatch) {
            const letter = letterMatch[0].toUpperCase(); // Extraire la lettre et la convertir en majuscule
            await sendMessage(senderId, `Vous avez choisi la lettre : ${letter}. Veuillez entrer un numéro de page (0, 25, 50, etc.).`);
            return;
        }

        // Vérifier si l'utilisateur a entré un numéro de page
        const pageMatch = prompt.match(/^(\d+)$/);
        if (pageMatch) {
            const page = pageMatch[0]; // Extraire le numéro de page
            const apiUrl = `https://dictionnairemlgfr.vercel.app/recherche?dictionnaire=${letter}&page=${page}`;
            const response = await axios.get(apiUrl);

            // Vérifier la réponse de l'API
            if (response.data && response.data.definitions) {
                const definitions = response.data.definitions.filter(def => def); // Filtrer les définitions vides
                await sendMessage(senderId, definitions.join(", "));
            } else {
                await sendMessage(senderId, "Aucune définition trouvée pour cette recherche.");
            }
            return;
        }

        // Si la requête ne correspond à aucun des cas ci-dessus
        await sendMessage(senderId, "Commande non reconnue. Utilisez 'dico' pour commencer.");
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API du dictionnaire:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche dans le dictionnaire.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "dico",  // Le nom de la commande
    description: "Permet de rechercher des mots dans le dictionnaire français-malgache.",  // Description de la commande
    usage: "Envoyez 'dico' pour commencer, puis entrez une lettre et un numéro de page."  // Comment utiliser la commande
};
