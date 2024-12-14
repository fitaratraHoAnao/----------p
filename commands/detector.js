const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// URL de l'API de détection IA
const BASE_API_URL = 'https://kaiz-apis.gleeze.com/api/aidetector-v2';

module.exports = async (senderId, userText) => {
    // Extraire le texte à analyser en retirant le préfixe 'aidetector' et en supprimant les espaces superflus
    const input = userText.slice(10).trim();

    // Vérifier si le texte est vide
    if (!input) {
        await sendMessage(senderId, 'Veuillez fournir un texte à analyser.');
        return;
    }

    try {
        // Envoyer un message indiquant que l'analyse est en cours
        await sendMessage(senderId, "🔍 Analyse en cours, veuillez patienter…");

        // Appeler l'API avec le texte fourni
        const apiUrl = `${BASE_API_URL}?q=${encodeURIComponent(input)}`;
        const { data: { ai, human, message } } = await axios.get(apiUrl);

        // Construire une réponse détaillée
        const fullResponse = `🤖 AI Generated: ${ai}\n\n🧑‍🎓 Human Generated: ${human}\n\n📃 Message: ${message}`;

        // Vérifier si la réponse est trop longue et la diviser si nécessaire
        if (fullResponse.length > 2000) {
            const messages = splitMessageIntoChunks(fullResponse, 2000);
            for (const chunk of messages) {
                await sendMessage(senderId, chunk);
            }
        } else {
            await sendMessage(senderId, fullResponse);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API de détection IA:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, '❌ Une erreur s\'est produite lors du traitement de votre demande.');
    }
};

// Ajouter les informations sur la commande
module.exports.info = {
    name: "detector",
    description: "Analyse un texte pour déterminer s'il a été écrit par une IA ou un humain.",
    usage: "Envoyez 'aidetector <votre texte>' pour lancer l'analyse.",
};

// Fonction utilitaire pour diviser un texte en morceaux
const splitMessageIntoChunks = (text, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
};
