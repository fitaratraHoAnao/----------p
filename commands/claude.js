const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration de l'URL de base de votre API
const BASE_API_URL = 'https://api.kenliejugarap.com/blackbox-claude/';
// URL de l'API MyMemory pour la traduction
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Stockage des sessions pour conserver le contexte de la conversation
const userSessions = {};

module.exports = async (senderId, userText) => {
    const prompt = userText.slice(6).trim(); // Extraire le prompt en retirant le préfixe 'claude'

    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    // Initialiser la session de l'utilisateur s'il n'existe pas encore
    if (!userSessions[senderId]) {
        userSessions[senderId] = [];
    }

    // Ajouter le prompt actuel à l'historique de conversation de l'utilisateur
    userSessions[senderId].push({ role: 'user', content: prompt });

    try {
        await sendMessage(senderId, "📲💫 Patientez, la réponse arrive… 💫📲");

        // Limiter l'historique à 5 messages récents pour éviter les données excessives
        const recentHistory = userSessions[senderId].slice(-5);
        const conversationHistory = recentHistory
            .map(entry => `${entry.role}: ${entry.content}`)
            .join('\n');

        // Vérifier si la requête dépasse la longueur autorisée
        if (conversationHistory.length > 5000) { // Ajuster cette limite selon votre API
            await sendMessage(senderId, 'Votre requête est trop longue. Veuillez réduire la taille de votre question.');
            return;
        }

        // Appel à l'API Claude avec la méthode POST
        const response = await axios.post(BASE_API_URL, {
            text: conversationHistory, // Historique limité
            userId: senderId
        });

        const reply = response.data.response;

        // Ajouter la réponse du bot à l'historique de conversation de l'utilisateur
        userSessions[senderId].push({ role: 'bot', content: reply });

        // Fonction pour traduire un texte en français via MyMemory
        const translateToFrench = async (text) => {
            const response = await axios.get(MYMEMORY_API_URL, {
                params: {
                    q: text,
                    langpair: 'en|fr'
                }
            });
            return response.data.responseData.translatedText;
        };

        // Découper la réponse en phrases pour traduire chaque segment
        const segments = reply.split(/(?<=\.)\s+/); // Découpe par phrase

        // Traduire chaque segment et combiner les traductions
        const translatedSegments = await Promise.all(segments.map(translateToFrench));
        const translatedReply = translatedSegments.join(' ');

        // Envoyer la réponse traduite à l'utilisateur
        await sendMessage(senderId, translatedReply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Claude ou MyMemory:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "claude",
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",
    usage: "Envoyez 'claude <votre question>' pour obtenir une réponse."
};
