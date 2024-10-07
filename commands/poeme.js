const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, title) => {
    try {
        // Envoyer un message de confirmation que la recherche est en cours
        await sendMessage(senderId, "Recherche du poème...");

        // Appeler l'API PoetryDB pour obtenir le poème
        const poetryUrl = `https://poetrydb.org/title/${encodeURIComponent(title)}`;
        const response = await axios.get(poetryUrl);

        const poem = response.data[0];
        if (!poem) {
            return await sendMessage(senderId, "Poème non trouvé.");
        }

        // Combiner les lignes du poème
        const poemText = poem.lines.join(' ');

        // Fonction pour découper en morceaux de 450 caractères
        const splitText = (text, size) => {
            const regex = new RegExp(`.{1,${size}}`, 'g');
            return text.match(regex);
        };

        // Découper le texte en morceaux de 450 caractères
        const textChunks = splitText(poemText, 450);
        let translatedChunks = [];

        // Traduire chaque morceau via l'API MyMemory
        for (const chunk of textChunks) {
            const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|fr`;
            const { data } = await axios.get(translationUrl);

            // Vérifier si la traduction est réussie
            if (data.responseData && data.responseData.translatedText) {
                translatedChunks.push(data.responseData.translatedText);
            } else {
                await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la traduction.");
                return;
            }
        }

        // Combiner les morceaux traduits
        const translatedPoem = translatedChunks.join(' ');

        // Envoyer la traduction du poème à l'utilisateur
        await sendMessage(senderId, `Voici le poème traduit :\n\n${translatedPoem}`);
    } catch (error) {
        console.error('Erreur lors de la recherche du poème ou de la traduction:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "poeme",
    description: "Recherche et traduit un poème.",
    usage: "Envoyez 'poeme <titre>' pour obtenir et traduire un poème."
};
