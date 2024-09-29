const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

// Fonction pour découper le texte en morceaux de 500 caractères maximum
function splitTextIntoChunks(text, maxLength = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;
}

// Fonction pour traduire du texte avec MyMemory, en découpant si nécessaire
async function translateTextWithLimit(text, fromLang, toLang) {
    const chunks = splitTextIntoChunks(text, 500); // Découper le texte en morceaux de 500 caractères maximum
    const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${fromLang}|${toLang}`;
        const response = await axios.get(translateUrl);
        return response.data.responseData.translatedText;
    }));
    return translatedChunks.join(' '); // Recombiner les morceaux traduits
}

module.exports = async (senderId, userText) => {
    // Extraire le nom de la personne en retirant le préfixe 'historique' et en supprimant les espaces superflus
    let person = userText.slice(10).trim().toLowerCase();

    if (!person) {
        await sendMessage(senderId, 'Veuillez fournir un nom de personne pour obtenir des informations historiques.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "Recherche en cours...");

        // Appeler l'API de recherche de Wikipédia avec le nom fourni
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(person)}&format=json`;
        const searchResponse = await axios.get(searchUrl);

        const searchResults = searchResponse.data.query.search;

        // Vérifier s'il y a des résultats de recherche
        if (!searchResults || searchResults.length === 0) {
            await sendMessage(senderId, `Désolé, je n'ai trouvé aucune information pour "${person}".`);
            return;
        }

        // Récupérer le premier résultat de la recherche (le plus pertinent)
        const firstResult = searchResults[0];
        const pageTitle = firstResult.title;

        // Appeler l'API pour obtenir le résumé de la page correspondante
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
        const summaryResponse = await axios.get(summaryUrl);

        // Récupérer les informations pertinentes de l'API
        const { title, extract, thumbnail, content_urls } = summaryResponse.data;

        if (!extract) {
            await sendMessage(senderId, `Désolé, je n'ai trouvé aucune information sur "${pageTitle}".`);
            return;
        }

        // Traduire le titre et le résumé avec MyMemory
        const translatedTitle = await translateTextWithLimit(title, 'en', 'fr');
        const translatedExtract = await translateTextWithLimit(extract, 'en', 'fr');

        // Construire le message de réponse avec les informations traduites
        let reply = `**${translatedTitle}**\n\n${translatedExtract}\n\n[En savoir plus ici](${content_urls.desktop.page})`;

        // Ajouter une image si disponible
        if (thumbnail && thumbnail.source) {
            reply += `\n![Image](${thumbnail.source})`;
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2 secondes pour un délai naturel
        await sendMessage(senderId, reply);

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Wikipedia :', error);

        if (error.response) {
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre demande. (Erreur: ' + error.response.status + ')');
        } else if (error.request) {
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu atteindre le service. Vérifiez votre connexion Internet.');
        } else {
            await sendMessage(senderId, 'Une erreur inconnue s\'est produite. Veuillez réessayer.');
        }
    }
};

module.exports.info = {
    name: "historique",
    description: "Obtenez des informations historiques sur une personne.",
    usage: "Envoyez 'historique <nom>' pour obtenir des informations."
};
