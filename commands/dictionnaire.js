const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); 

module.exports = async (senderId, userText) => {
    try {
        const wordToLookup = userText.trim().toLowerCase(); 

        if (!wordToLookup) {
            await sendMessage(senderId, "Veuillez fournir un mot à rechercher dans le dictionnaire.");
            return;
        }

        // URL de l'API
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(wordToLookup)}`;
        const response = await axios.get(apiUrl);

        // Log de la réponse API pour voir la structure
        console.log('Réponse API:', response.data);

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
            await sendMessage(senderId, "Désolé, je n'ai pas pu trouver de définition pour ce mot.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Dictionary:', error.response ? error.response.data : error.message);

        // Envoyer un message d'erreur à l'utilisateur
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors de la recherche dans le dictionnaire.');
    }
};
