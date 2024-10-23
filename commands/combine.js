const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Vérifier si le mot se termine par -er, -ir, -re, etc. pour savoir s'il s'agit d'un verbe
        const verbeRegex = /er$|ir$|re$|oir$/;

        if (verbeRegex.test(prompt)) {
            // Si c'est un verbe, appeler à la fois l'API de conjugaison et de définition
            const conjugaisonApiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?conjugaison=${encodeURIComponent(prompt)}`;
            const definitionApiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;

            // Appeler les deux API simultanément
            const [conjugaisonResponse, definitionResponse] = await Promise.all([
                axios.get(conjugaisonApiUrl),
                axios.get(definitionApiUrl)
            ]);

            // Envoyer la définition
            const definition = definitionResponse.data.definitions.join('\n');
            const word = definitionResponse.data.word;
            const category = definitionResponse.data.category;
            await sendMessage(senderId, `Mot : ${word}\nCatégorie : ${category}\nDéfinitions :\n${definition}`);

            // Extraire les conjugaisons
            const conjugaison = conjugaisonResponse.data.conjugaison;

            // Liste des modes à envoyer par groupe de deux
            const modes = Object.keys(conjugaison);
            
            for (let i = 0; i < modes.length; i += 2) {
                let message = '';
                
                // Construire la réponse pour deux modes à la fois
                for (let j = i; j < i + 2 && j < modes.length; j++) {
                    const mode = modes[j];
                    message += `Mode : ${mode}\n`;

                    const tenses = conjugaison[mode];
                    for (const [tense, forms] of Object.entries(tenses)) {
                        message += `- ${tense}\n`;
                        forms.forEach(form => {
                            message += `${form}\n`;
                        });
                        message += '\n';
                    }
                }

                // Envoyer les deux modes
                await sendMessage(senderId, message);

                // Attendre 2 secondes avant d'envoyer la réponse suivante
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } else {
            // Si ce n'est pas un verbe, utiliser l'API pour la définition uniquement
            const apiUrl = `https://dictionnaire-francais-francais.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl);

            // Extraire la définition
            const definition = response.data.definitions.join('\n');
            const word = response.data.word;
            const category = response.data.category;

            // Envoyer la définition
            await sendMessage(senderId, `Mot : ${word}\nCatégorie : ${category}\nDéfinitions :\n${definition}`);
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "combine",  // Le nom de la commande
    description: "Permet de rechercher la définition et la conjugaison d'un verbe ou un mot.",  // Nouvelle description
    usage: "Envoyez 'combine <mot>' pour obtenir la définition d'un mot ou la conjugaison d'un verbe."  // Comment utiliser la commande
};
