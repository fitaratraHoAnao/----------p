const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

module.exports = async (senderId, prompt) => {
    try {
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        const verbeRegex = /er$|ir$|re$|oir$/;

        if (verbeRegex.test(prompt)) {
            const conjugaisonApiUrl = `https://dictionnaire-conjugaison.vercel.app/recherche?conjugaison=${encodeURIComponent(prompt)}`;
            const definitionApiUrl = `https://dictionnaire-conjugaison.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;

            const [conjugaisonResponse, definitionResponse] = await Promise.all([
                axios.get(conjugaisonApiUrl),
                axios.get(definitionApiUrl)
            ]);

            const definition = definitionResponse.data.definitions.join('\n');
            const word = definitionResponse.data.word;
            const category = definitionResponse.data.category;

            await sendMessage(senderId, `👉 Voici la définition de **${word}** :\n✅ Mot : **${word}**\n✅ Catégorie : **${category}**\n✅ Définitions :\n${definition}`);

            const conjugaison = conjugaisonResponse.data.conjugaison;
            const modes = Object.keys(conjugaison);
            
            for (let i = 0; i < modes.length; i += 2) {
                let message = `👉 Voici la conjugaison du verbe **${word}** :\n`;

                for (let j = i; j < i + 2 && j < modes.length; j++) {
                    const mode = modes[j];
                    message += `\nMode : ❤️ **${mode}** ❤️\n`;

                    const tenses = conjugaison[mode];
                    for (const [tense, forms] of Object.entries(tenses)) {
                        message += `✅ - ${tense}\n`;
                        forms.forEach(form => {
                            message += `${form}\n`;
                        });
                        message += '\n';
                    }
                }

                await sendMessage(senderId, message);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } else {
            const apiUrl = `https://dictionnaire-conjugaison.vercel.app/recherche?dico=${encodeURIComponent(prompt)}`;
            const response = await axios.get(apiUrl);

            const definition = response.data.definitions.join('\n');
            const word = response.data.word;
            const category = response.data.category;

            await sendMessage(senderId, `👉 Voici la définition de **${word}** :\n✅ Mot : **${word}**\n✅ Catégorie : **${category}**\n✅ Définitions :\n${definition}`);
        }

    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

module.exports.info = {
    name: "combine",
    description: "Permet de rechercher la définition et la conjugaison d'un verbe ou un mot.",
    usage: "Envoyez 'combine <mot>' pour obtenir la définition d'un mot ou la conjugaison d'un verbe."
};
