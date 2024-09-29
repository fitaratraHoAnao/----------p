const axios = require('axios');
const fs = require('fs');
const path = require('path');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText, event) => {
    const args = userText.split(" ").slice(1); // Extraire les arguments

    try {
        if (!args[0]) {
            return sendMessage(senderId, "Veuillez fournir un prompt pour Bruno.", event.threadID);
        }

        const prompt = encodeURIComponent(args.join(" "));
        const apiUrl = `https://llama3-70b.vercel.app/api?ask=${prompt}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data.response) {
            const catApiUrl = 'https://api.thecatapi.com/v1/images/search?limit=5';
            const catResponse = await axios.get(catApiUrl);

            if (catResponse.data && catResponse.data.length > 0) {
                const imageUrls = catResponse.data.map(cat => cat.url);
                const imagePromises = imageUrls.map(async (url) => {
                    const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
                    const imagePath = path.join(__dirname, path.basename(url));
                    fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
                    return imagePath; // Retourner le chemin du fichier
                });

                const imagePaths = await Promise.all(imagePromises);

                // Envoyer le message avec les images
                await sendMessage(senderId, {
                    body: response.data.response,
                    attachment: imagePaths.map(imagePath => fs.createReadStream(imagePath)) // Créer les streams
                }, event.threadID);

                // Supprimer les fichiers après l'envoi
                imagePaths.forEach(imagePath => fs.unlinkSync(imagePath));
            } else {
                sendMessage(senderId, response.data.response, event.threadID);
            }
        } else {
            sendMessage(senderId, "Impossible d'obtenir une réponse de Bruno.", event.threadID);
        }
    } catch (error) {
        console.error('Erreur lors de la requête à l\'API Llama:', error.message);
        sendMessage(senderId, "Une erreur est survenue lors du traitement de votre demande.", event.threadID);
    }
};

// Informations de la commande
module.exports.info = {
    name: "textcat",
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",
    usage: "Envoyez 'textcat <votre question>' pour obtenir une réponse."
};
