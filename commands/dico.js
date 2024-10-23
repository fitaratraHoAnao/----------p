const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Un objet pour stocker les lettres et les pages des utilisateurs
const userStates = {};

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur a déjà une lettre stockée
        const userState = userStates[senderId];

        // Si l'utilisateur envoie une lettre suivie d'un numéro de page
        if (prompt.match(/^([A-Z])\s*(\d+)$/)) {
            const [_, letter, page] = prompt.match(/^([A-Z])\s*(\d+)$/);
            userStates[senderId] = { letter: letter.toUpperCase() }; // Mettre à jour l'état de l'utilisateur avec la nouvelle lettre
            const apiUrl = `https://dictionnairemlgfr.vercel.app/recherche?dictionnaire=${letter}&page=${page}`;
            const response = await axios.get(apiUrl);
            await handleApiResponse(response, letter, senderId);
            return;
        }

        // Si l'utilisateur envoie juste un numéro de page
        if (userState && prompt.match(/^\d+$/)) {
            const page = prompt; // La page actuelle
            const letter = userState.letter; // Récupérer la lettre stockée
            const apiUrl = `https://dictionnairemlgfr.vercel.app/recherche?dictionnaire=${letter}&page=${page}`;
            const response = await axios.get(apiUrl);
            await handleApiResponse(response, letter, senderId);
            return;
        }

        // Vérifier si l'utilisateur a demandé le dictionnaire
        if (prompt.toLowerCase().startsWith('dico')) {
            // Extraire la commande et les arguments
            const args = prompt.split(' ').slice(1); // Enlever 'dico' et obtenir les arguments
            if (args.length !== 2) {
                await sendMessage(senderId, "Veuillez entrer la commande sous la forme : 'dico <lettre> <page>' (ex: dico A 25).");
                return;
            }

            const letter = args[0].toUpperCase(); // Prendre la lettre en majuscule
            const page = args[1]; // Prendre le numéro de page

            // Vérifier si la lettre est valide (une seule lettre)
            if (!/^[A-Z]$/.test(letter)) {
                await sendMessage(senderId, "Veuillez entrer une lettre valide (A-Z).");
                return;
            }

            // Vérifier si la page est un nombre valide
            if (!/^\d+$/.test(page)) {
                await sendMessage(senderId, "Veuillez entrer un numéro de page valide (0, 25, 50, etc.).");
                return;
            }

            // Stocker la lettre dans l'état de l'utilisateur
            userStates[senderId] = { letter };

            // Construire l'URL de l'API
            const apiUrl = `https://dictionnairemlgfr.vercel.app/recherche?dictionnaire=${letter}&page=${page}`;
            const response = await axios.get(apiUrl);
            await handleApiResponse(response, letter, senderId);
            return;
        }

        // Si la requête ne correspond à aucun des cas ci-dessus
        await sendMessage(senderId, "Commande non reconnue. Utilisez 'dico <lettre> <page>' pour rechercher dans le dictionnaire.");
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API du dictionnaire:', error.response ? error.response.data : error.message);
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
    let formattedResponse = `🇲🇬${letter}, Rechercher un mot français🇲🇬:\n`;
    formattedResponse += `✅🇲🇬 Dictionnaire Français-Malagasy 🇲🇬:\n\n`;
    formattedResponse += `✅ ${letter}\n`;
    formattedResponse += `✅❤️ Voici la réponse trouvée dans le dictionnaire pour la lettre ${letter} ❤️:\n\n`;

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
    description: "Permet de rechercher des mots dans le dictionnaire français-malgache.",  // Description de la commande
    usage: "Envoyez 'dico <lettre> <page>' pour poser une question."  // Comment utiliser la commande
};
