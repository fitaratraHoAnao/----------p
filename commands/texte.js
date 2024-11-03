const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une réponse...");

        // Appeler l'API pour récupérer l'article sur le football
        const apiUrl = 'https://texte-francais.vercel.app/recherche?titre=article-sur-le-theme-du-footbal';
        const response = await axios.get(apiUrl);

        // Extraire les informations de la réponse JSON
        const data = response.data;
        const titre = data.titre;
        const texte = data.texte.join("\n\n");  // Joins les paragraphes avec des sauts de ligne
        const vocabulaire = data.vocabulaire.join(", ");  // Joins les mots de vocabulaire avec des virgules

        // Diviser le texte et le vocabulaire en quatre morceaux
        const texteMorceaux = [];
        const vocabulaireMorceaux = [];
        const texteChunkSize = Math.ceil(texte.length / 4);
        const vocabulaireChunkSize = Math.ceil(vocabulaire.length / 4);

        for (let i = 0; i < 4; i++) {
            texteMorceaux.push(texte.slice(i * texteChunkSize, (i + 1) * texteChunkSize));
            vocabulaireMorceaux.push(vocabulaire.slice(i * vocabulaireChunkSize, (i + 1) * vocabulaireChunkSize));
        }

        // Envoyer les morceaux de texte et vocabulaire successivement
        for (let i = 0; i < 4; i++) {
            const messageToSend = `**Partie ${i + 1} du texte** :\n${texteMorceaux[i]}\n\n**Partie ${i + 1} du vocabulaire** :\n${vocabulaireMorceaux[i]}`;
            await sendMessage(senderId, messageToSend);
        }

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API:", error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "texte",  // Le nouveau nom de la commande
    description: "Permet d'obtenir un article et du vocabulaire sur le thème du football, envoyés en quatre parties.",  // Nouvelle description
    usage: "Envoyez 'texte' pour recevoir un article et du vocabulaire associé au thème du football en quatre parties."  // Usage mis à jour
};
