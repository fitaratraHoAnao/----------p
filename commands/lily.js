const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration des URL de base de vos APIs
const LILY_API_URL = 'http://sgp1.hmvhostings.com:25743/lily?q=';
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

module.exports = async (senderId, userText) => {
    // Extraire le prompt en retirant le préfixe 'lily' et en supprimant les espaces superflus
    const prompt = userText.slice(4).trim();

    // Vérifier si le prompt est vide
    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    try {
        // Envoyer un message de confirmation que la requête est en cours de traitement
        await sendMessage(senderId, "📲💫 Patientez, la réponse arrive… 💫📲");

        // Appeler l'API Lily avec le prompt fourni
        const lilyApiUrl = `${LILY_API_URL}${encodeURIComponent(prompt)}`;
        const lilyResponse = await axios.get(lilyApiUrl);

        // Récupérer la réponse texte de l'API Lily
        const lilyText = lilyResponse.data.lily[0]?.text || "Désolé, je n'ai pas pu obtenir de réponse.";

        // Diviser le texte en morceaux de 500 caractères maximum
        const textChunks = lilyText.match(/.{1,500}/g) || [];

        let translatedChunks = [];

        // Traduire chaque morceau avec l'API MyMemory
        for (const chunk of textChunks) {
            const myMemoryResponse = await axios.get(MYMEMORY_API_URL, {
                params: {
                    q: chunk,
                    langpair: 'en|fr' // Traduire de l'anglais au français
                }
            });

            const translatedText = myMemoryResponse.data.responseData.translatedText;
            translatedChunks.push(translatedText);

            // Attendre une courte durée pour éviter de surcharger l'API MyMemory
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Combiner tous les morceaux traduits en une seule réponse
        const finalResponse = translatedChunks.join(' ');

        // Attendre 2 secondes avant d'envoyer la réponse pour un délai naturel
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse traduite à l'utilisateur
        await sendMessage(senderId, finalResponse);
    } catch (error) {
        console.error('Erreur lors du traitement:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "lily", // Le nom de la commande
    description: "Discutez avec Lily, une assistante IA prête à répondre à vos questions.", // Description de la commande
    usage: "Envoyez 'lily <votre question>' pour discuter avec l'IA." // Comment utiliser la commande
};
