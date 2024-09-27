const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les recherches des utilisateurs
const userDictionaryRequests = {};

module.exports = async (senderId, userText) => {
    try {
        // Vérifier si l'utilisateur a fourni un mot à rechercher
        const wordToLookup = userText.trim().toLowerCase(); 

        // Si aucun mot n'est fourni, demander à l'utilisateur d'entrer un mot
        if (!wordToLookup) {
            await sendMessage(senderId, "Veuillez fournir un mot à rechercher dans le dictionnaire.");
            return;
        }

        // URL de l'API pour chercher le mot dans le dictionnaire
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordToLookup)}`;
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse contient les informations nécessaires
        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            let message = `🔎 **Mot** : ${data.word}\n`;

            // Ajouter la phonétique si elle existe
            if (data.phonetic) {
                message += `📖 **Phonétique** : ${data.phonetic}\n`;
            }

            // Ajouter les significations et exemples
            data.meanings.forEach((meaning) => {
                message += `\n📚 **Partie du discours** : ${meaning.partOfSpeech}\n`;
                meaning.definitions.forEach((definition, index) => {
                    message += `📋 **Définition ${index + 1}** : ${definition.definition}\n`;
                    if (definition.example) {
                        message += `💡 **Exemple** : ${definition.example}\n`;
                    }
                });
            });

            // Envoyer le message final à l'utilisateur
            await sendMessage(senderId, message);
        } else {
            await sendMessage(senderId, "Désolé, je n'ai pas pu trouver de définition pour ce mot.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Dictionary:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la recherche dans le dictionnaire.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "dictionnaire",  // Le nom de la commande
    description: "Recherchez un mot dans le dictionnaire et obtenez sa définition, phonétique et exemples.",  // Description de la commande
    usage: "Envoyez 'dictionnaire <mot>' pour obtenir les informations sur le mot."  // Comment utiliser la commande
};
