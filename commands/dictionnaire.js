const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); 

// Variable pour suivre l'état du dictionnaire
let activeDictionaryUsers = {};

module.exports = async (senderId, userText) => {
    try {
        // Si l'utilisateur a déjà activé le dictionnaire ou tape "dictionnaire", on l'active
        if (userText.toLowerCase().startsWith('dictionnaire')) {
            const word = userText.slice(12).trim();
            if (word) {
                await fetchAndSendDictionaryResponse(senderId, word);
            } else {
                await sendMessage(senderId, "Veuillez fournir un mot à rechercher.");
            }
            // Activer le mode dictionnaire pour cet utilisateur
            activeDictionaryUsers[senderId] = true;
        } 
        // Si le dictionnaire est déjà activé pour cet utilisateur, traiter chaque mot sans "dictionnaire"
        else if (activeDictionaryUsers[senderId]) {
            const word = userText.trim();
            await fetchAndSendDictionaryResponse(senderId, word);
        } else {
            // L'utilisateur doit d'abord activer la commande dictionnaire
            await sendMessage(senderId, "Tapez 'dictionnaire [mot]' pour commencer la recherche.");
        }
    } catch (error) {
        console.error('Erreur lors de la recherche dans le dictionnaire:', error.message);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la recherche dans le dictionnaire.');
    }
};

// Fonction pour appeler l'API et envoyer la réponse
async function fetchAndSendDictionaryResponse(senderId, word) {
    try {
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
        const response = await axios.get(apiUrl);

        if (response.data && response.data.length > 0) {
            const data = response.data[0];
            let message = `🔎 **Mot** : ${data.word}\n`;

            if (data.phonetic) {
                message += `📖 **Phonétique** : ${data.phonetic}\n`;
            }

            data.meanings.forEach((meaning) => {
                message += `\n📚 **Partie du discours** : ${meaning.partOfSpeech}\n`;
                meaning.definitions.forEach((definition, index) => {
                    message += `📋 **Définition ${index + 1}** : ${definition.definition}\n`;
                });
            });

            await sendMessage(senderId, message);
        } else {
            await sendMessage(senderId, `Désolé, aucune définition trouvée pour "${word}".`);
        }
    } catch (error) {
        throw new Error(`Impossible de rechercher le mot : ${word}`);
    }
}
