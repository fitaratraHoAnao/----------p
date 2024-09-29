const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText, event) => {
    // Extraire le prompt en retirant le préfixe 'textcat' et en supprimant les espaces superflus
    const args = userText.split(" ").slice(1); // Assurez-vous que les arguments sont correctement extraits

    try {
        if (!args[0]) {
            return sendMessage(event.threadID, "Veuillez fournir un prompt pour Bruno.");
        }

        const prompt = encodeURIComponent(args.join(" "));
        const apiUrl = `https://llama3-70b.vercel.app/api?ask=${prompt}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.response) {
            // Récupération des images de chats
            const catApiUrl = 'https://api.thecatapi.com/v1/images/search?limit=5'; // Modifier le limit pour le nombre d'images souhaité
            const catResponse = await axios.get(catApiUrl);

            if (catResponse.data && catResponse.data.length > 0) {
                const imageUrls = catResponse.data.map(cat => cat.url);

                const imagePromises = imageUrls.map(async (url) => {
                    const imagePath = path.join(__dirname, path.basename(url));
                    const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(imagePath, Buffer.from(imageResponse.data, 'binary'));
                    return fs.createReadStream(imagePath);
                });

                const images = await Promise.all(imagePromises);

                // Envoyer le message avec les images
                sendMessage(event.threadID, { body: response.data.response, attachment: images }, () => {
                    images.forEach(image => {
                        fs.unlinkSync(image.path); // Supprimer les images après l'envoi
                    });
                });
            } else {
                sendMessage(event.threadID, response.data.response);
            }
        } else {
            sendMessage(event.threadID, "Impossible d'obtenir une réponse de Bruno.");
        }
    } catch (error) {
        console.error('Erreur lors de la requête à l\'API Llama:', error.message);
        sendMessage(event.threadID, "Une erreur est survenue lors du traitement de votre demande.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "textcat",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez 'textcat <votre question>' pour obtenir une réponse."  // Comment utiliser la commande
};
