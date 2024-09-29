const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId) => {
    try {
        // Envoyer un message de confirmation que la requête est en cours
        await sendMessage(senderId, "Je recherche un verset biblique...");

        // Appeler l'API pour obtenir un verset biblique aléatoire
        const apiUrl = 'https://bible-api.com/?random=verse';
        const response = await axios.get(apiUrl);

        // Vérifier si la réponse contient bien les informations nécessaires
        if (response.data && response.data.reference && response.data.verses && response.data.translation_name) {
            const verseData = response.data.verses[0];
            const originalText = `${verseData.book_name} ${verseData.chapter}:${verseData.verse}:\n\n${verseData.text}\n\nTraduction: ${response.data.translation_name}`;

            // Appeler l'API MyMemory pour traduire le texte en français
            const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(verseData.text)}&langpair=en|fr`;
            const translateResponse = await axios.get(translateUrl);

            // Vérifier si la traduction a réussi
            const translatedText = translateResponse.data.responseData.translatedText;

            // Créer le message final avec le texte traduit
            const translatedMessage = `${verseData.book_name} ${verseData.chapter}:${verseData.verse}:\n\n${translatedText}\n\n(Traduction: ${response.data.translation_name})`;

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer le verset biblique traduit à l'utilisateur
            await sendMessage(senderId, translatedMessage);
        } else {
            // Si les informations sont manquantes, envoyer un message d'erreur à l'utilisateur
            await sendMessage(senderId, "Je n'ai pas pu récupérer un verset biblique. Veuillez réessayer.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de versets bibliques ou de traduction:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération ou de la traduction du verset biblique.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "bible",  // Le nom de la commande
    description: "Envoyer un verset biblique aléatoire et le traduire en français",  // Description de la commande
    usage: "Envoyez 'bible' pour recevoir un verset biblique aléatoire traduit en français."  // Comment utiliser la commande
};
