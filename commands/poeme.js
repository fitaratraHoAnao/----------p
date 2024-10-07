const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, title) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Recherche du poème en cours...");

        // Appeler l'API de PoetryDB pour récupérer le poème
        const apiUrl = `https://poetrydb.org/title/${title}`;
        const response = await axios.get(apiUrl);
        
        // Vérifier si le poème a été trouvé
        if (response.data.length === 0) {
            await sendMessage(senderId, "Désolé, je n'ai pas trouvé de poème avec ce titre.");
            return;
        }

        const poem = response.data[0];
        const lines = poem.lines; // Récupérer les lignes du poème
        const translatedPoem = [];

        // Découper le texte en morceaux de maximum 450 caractères
        const chunks = [];
        let currentChunk = '';
        for (const line of lines) {
            if ((currentChunk + line).length <= 450) {
                currentChunk += line + '\n';
            } else {
                chunks.push(currentChunk.trim());
                currentChunk = line + '\n';
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        // Traduire chaque morceau avec l'API MyMemory
        for (const chunk of chunks) {
            const translationResponse = await axios.post('https://api.mymemory.translated.net/get', null, {
                params: {
                    q: chunk,
                    langpair: 'en|fr'
                }
            });

            const translatedText = translationResponse.data.responseData.translatedText;
            translatedPoem.push(translatedText);
        }

        // Combiner les morceaux traduits en respectant les sauts de ligne
        const finalTranslatedPoem = translatedPoem.join('\n\n'); // Ajoute une ligne vide entre les strophes

        // Formater la réponse
        let formattedResponse = `Voici le poème "${poem.title}" de ${poem.author} traduit :\n\n${finalTranslatedPoem}`;

        // Attendre 2 secondes avant d'envoyer la réponse
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Envoyer la réponse de traduction à l'utilisateur
        await sendMessage(senderId, formattedResponse);
    } catch (error) {
        console.error('Erreur lors de l\'appel aux API :', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "poeme",  // Le nom de la commande pour récupérer un poème
    description: "Permet de récupérer un poème par son titre et de le traduire en français.",  // Description de la commande
    usage: "Envoyez 'poeme <titre>' pour récupérer et traduire le poème."  // Comment utiliser la commande
};
