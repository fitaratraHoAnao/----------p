const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, prompt) => {
    try {
        // Informer l'utilisateur que le message est reçu et que le bot prépare une réponse
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // URL des API pour obtenir la définition et la conjugaison
        const definitionApiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
        const conjugaisonApiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?conjugaison=${encodeURIComponent(prompt)}`;

        // Appels API pour récupérer les données
        const [definitionResponse, conjugaisonResponse] = await Promise.all([
            axios.get(definitionApiUrl),
            axios.get(conjugaisonApiUrl)
        ]);

        console.log("Définition API Response:", definitionResponse.data);
        console.log("Conjugaison API Response:", conjugaisonResponse.data);

        // Vérification des données de définition
        if (!definitionResponse.data.response) {
            throw new Error("Les données de définition sont manquantes.");
        }

        // Vérification des données de conjugaison
        if (!conjugaisonResponse.data.response) {
            throw new Error("Les données de conjugaison sont manquantes.");
        }

        // Envoi de la définition
        await sendMessage(senderId, `👉 Voici la définition de ${prompt} :\n${definitionResponse.data.response}`);

        // Envoi de la conjugaison, en séparant les modes
        const conjugaisonMessage = conjugaisonResponse.data.response;
        const modes = conjugaisonMessage.split("Mode :"); // Supposons que les modes commencent par "Mode :"

        for (let i = 1; i < modes.length; i += 2) { // Envoie 2 modes par itération
            let modeMessage = `Mode :${modes[i]}`;
            if (modes[i + 1]) {
                modeMessage += `\nMode :${modes[i + 1]}`;
            }
            await sendMessage(senderId, modeMessage);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Pause de 2 secondes entre les messages
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};
