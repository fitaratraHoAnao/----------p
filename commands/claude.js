const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Déclaration des URL d'API
const BASE_API_URL = 'https://api.kenliejugarap.com/blackbox-claude/';
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Stockage des sessions pour conserver le contexte de la conversation
const userSessions = {};

module.exports = async (senderId, userText) => {
    const prompt = userText.slice(6).trim(); // Extraire le prompt en retirant le préfixe 'claude'

    if (!prompt) {
        await sendMessage(senderId, 'Veuillez fournir une question ou un sujet pour que je puisse vous aider.');
        return;
    }

    // Initialiser la session de l'utilisateur si elle n'existe pas encore
    if (!userSessions[senderId]) {
        userSessions[senderId] = [];
    }

    // Ajouter le prompt actuel à l'historique de conversation de l'utilisateur
    userSessions[senderId].push({ role: 'user', content: prompt });

    try {
        await sendMessage(senderId, "📲💫 Patientez, la réponse arrive… 💫📲");

        // Préparer l'historique de la conversation
        const conversationHistory = userSessions[senderId]
            .map(entry => `${entry.role}: ${entry.content}`)
            .join('\n');

        // Appel à l'API Claude avec l'historique
        const apiUrl = `${BASE_API_URL}?text=${encodeURIComponent(conversationHistory)}&userId=${senderId}`;
        const response = await axios.get(apiUrl);
        const reply = response.data.response;

        // Ajouter la réponse du bot à l'historique de conversation de l'utilisateur
        userSessions[senderId].push({ role: 'bot', content: reply });

        // Fonction pour découper un texte en segments de taille maximale
        const splitText = (text, maxLength) => {
            const words = text.split(' ');
            const segments = [];
            let currentSegment = [];

            words.forEach(word => {
                if ((currentSegment.join(' ').length + word.length + 1) <= maxLength) {
                    currentSegment.push(word);
                } else {
                    segments.push(currentSegment.join(' '));
                    currentSegment = [word];
                }
            });

            if (currentSegment.length > 0) {
                segments.push(currentSegment.join(' '));
            }

            return segments;
        };

        // Découper la réponse en segments de 500 mots
        const segments = splitText(reply, 500);

        // Traduire chaque segment en français
        const translateToFrench = async (text) => {
            try {
                const response = await axios.get(MYMEMORY_API_URL, {
                    params: {
                        q: text,
                        langpair: 'en|fr'
                    }
                });
                return response.data.responseData.translatedText;
            } catch (error) {
                console.error('Erreur lors de la traduction :', error);
                return 'Erreur de traduction pour ce segment.';
            }
        };

        // Traduire chaque segment et assembler les résultats
        const translatedSegments = await Promise.all(segments.map(segment => translateToFrench(segment)));
        const translatedReply = translatedSegments.join(' ');

        // Envoyer la réponse traduite à l'utilisateur
        await sendMessage(senderId, translatedReply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Claude ou MyMemory:', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre question. Veuillez réessayer plus tard.');
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "claude",
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",
    usage: "Envoyez 'claude <votre question>' pour obtenir une réponse."
};
