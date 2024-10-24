const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Déterminer si le mot est un verbe en fonction de sa terminaison
        const verbEndings = ['er', 'ir', 're', 'oir'];
        const isVerb = verbEndings.some(ending => prompt.toLowerCase().endsWith(ending));

        let reply = '';

        if (isVerb) {
            // Appeler les deux API (définition et conjugaison) pour les verbes
            const definitionUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
            const conjugaisonUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?conjugaison=${encodeURIComponent(prompt)}`;

            // Faire des appels API en parallèle
            const [definitionResponse, conjugaisonResponse] = await Promise.all([
                axios.get(definitionUrl),
                axios.get(conjugaisonUrl)
            ]);

            // Traiter la réponse de l'API conjugaison
            const conjugaisonData = conjugaisonResponse.data.response;
            const modes = conjugaisonData.split("Mode :");

            reply += `Voici la conjugaison du verbe ${prompt} :\n${modes[1]}\n${modes[2]}`;
            
            // Envoyer la première partie de la conjugaison
            await sendMessage(senderId, reply);

            // Attendre avant d'envoyer la suite de la conjugaison
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer la deuxième partie de la conjugaison
            reply = `Suite de la conjugaison du verbe ${prompt} :\n${modes[3]}\n${modes[4]}`;
            await sendMessage(senderId, reply);

            // Traiter la réponse de l'API définition
            reply = definitionResponse.data.response;
        } else {
            // Appeler uniquement l'API définition pour les autres mots
            const definitionUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
            const definitionResponse = await axios.get(definitionUrl);
            reply = definitionResponse.data.response;
        }

        // Attendre 2 secondes avant d'envoyer la réponse finale
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse finale à l'utilisateur (pour la définition dans les deux cas)
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel aux APIs:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "combine",  // Le nom de la commande
    description: "Permet de rechercher à la fois des conjugaisons et des définitions automatiquement en fonction du mot.",  // Description de la commande
    usage: "Envoyez 'combine <mot>' pour obtenir la définition ou la conjugaison d'un mot."  // Comment utiliser la commande
};
