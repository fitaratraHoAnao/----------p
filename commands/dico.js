const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Fonction principale pour gérer les messages du bot
module.exports = async (senderId, prompt) => {
    // Décomposer le prompt pour obtenir la lettre et la page
    const parts = prompt.split(' ');
    let letter = parts[1]?.toUpperCase(); // Obtenir la lettre (A, B, etc.)
    let page = parts[2]; // Obtenir la page (0, 25, 50, etc.)

    // Vérifier si la commande est bien formée
    if (!letter || !/^[A-Z]$/.test(letter) || (page && !/^\d+$/.test(page))) {
        await sendMessage(senderId, "Veuillez utiliser la commande au format: dico <lettre> <page>.");
        return;
    }

    // Message de confirmation
    await sendMessage(senderId, `Vous avez autorisé à utiliser le dictionnaire pour la lettre ${letter}.`);

    // Construire l'URL de l'API
    const apiUrl = `https://dictionnairemlgfr.vercel.app/recherche?dictionnaire=${letter}&page=${page || 0}`;

    try {
        // Appeler l'API
        const response = await axios.get(apiUrl);
        await handleApiResponse(response, letter, senderId);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche dans le dictionnaire.");
    }
};

// Fonction pour gérer la réponse de l'API
async function handleApiResponse(response, letter, senderId) {
    // Vérifier la réponse de l'API
    if (!response.data || !response.data.definitions) {
        await sendMessage(senderId, "Erreur lors de la récupération des définitions.");
        return;
    }

    // Filtrer les définitions vides
    const definitions = response.data.definitions.filter(def => def);

    // Formater la réponse
    let formattedResponse = `🇲🇬 Dictionnaire Français-Malagasy 🇲🇬:\n\n`;
    formattedResponse += `❤️ Voici la réponse trouvée dans le dictionnaire pour les lettres ${letter} ❤️:\n\n`;

    // Ajout des définitions avec emoji
    definitions.forEach(def => {
        // Ajout d'un espace entre le mot et son type
        const formattedDef = def.replace(/([a-zA-Z]+)(verbe|nom|adjectif|adverbe)/, '$1 $2');
        formattedResponse += `✅ ${formattedDef}\n`;
    });

    await sendMessage(senderId, formattedResponse);
}

// Ajouter les informations de la commande
module.exports.info = {
    name: "dico",  // Le nom de la commande
    description: "Permet d'utiliser le dictionnaire Français-Malagasy.",  // Description de la commande
    usage: "Envoyez 'dico <lettre> <page>' pour rechercher dans le dictionnaire."  // Comment utiliser la commande
};
