const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
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

            // Construire l'URL de l'API
            const apiUrl = `https://dictionnairemlgfr.vercel.app/recherche?dictionnaire=${letter}&page=${page}`;
            const response = await axios.get(apiUrl);

            // Vérifier la réponse de l'API
            if (!response.data || !response.data.definitions) {
                await sendMessage(senderId, "Erreur lors de la récupération des définitions.");
                return;
            }

            // Filtrer les définitions vides
            const definitions = response.data.definitions.filter(def => def);

            // Formater la réponse
            let formattedResponse = "🇲🇬" + letter + ", Rechercher un mot français🇲🇬:\n";

            // Ajout des définitions avec emoji
            definitions.forEach(def => {
                // Ajout d'un espace entre le mot et son type
                const formattedDef = def.replace(/([a-zA-Z]+)(verbe|nom|adjectif|adverbe)/, '$1 $2');
                formattedResponse += `✅ ${formattedDef}\n`;
            });

            await sendMessage(senderId, formattedResponse);
            return;
        }

        // Si la requête ne correspond à aucun des cas ci-dessus
        await sendMessage(senderId, "Commande non reconnue. Utilisez 'dico <lettre> <page>' pour rechercher dans le dictionnaire.");
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API du dictionnaire:', error.response ? error.response.data : error.message);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la recherche dans le dictionnaire.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "dico",  // Le nom de la commande
    description: "Permet de rechercher des mots dans le dictionnaire français-malgache.",  // Description de la commande
    usage: "Envoyez 'dico <lettre> <page>' pour poser une question."  // Comment utiliser la commande
};
