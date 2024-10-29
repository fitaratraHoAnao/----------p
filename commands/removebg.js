const axios = require('axios');
const sendMessage = require('../handles/sendMessage');
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userSessions = {};

module.exports = async (senderId, prompt, message) => {
    try {
        // Vérifiez si le message contient des pièces jointes
        if (!message.attachments || message.attachments.length === 0) {
            await sendMessage(senderId, "Veuillez envoyer une image en pièce jointe pour supprimer son arrière-plan.");
            return;
        }

        // Vérifiez si le fichier joint est une photo
        if (message.attachments[0].type !== "photo") {
            await sendMessage(senderId, "Ce n'est pas une photo.");
            return;
        }

        // URL de l'image à traiter
        const imageUrl = message.attachments[0].url;
        const removeBgApiUrl = `https://remove-bg-ten.vercel.app/api/remove?url=${imageUrl}`;

        // Appeler l'API Remove.bg
        const response = await axios.get(removeBgApiUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const filePath = path.join(__dirname, 'no_background.png');

        // Enregistrer l'image sans arrière-plan
        await fs.outputFile(filePath, imageBuffer);
        
        // Envoyer l'image sans arrière-plan
        await sendMessage(senderId, {
            body: "Voici l'image avec l'arrière-plan supprimé.",
            attachment: fs.createReadStream(filePath)
        });

        // Supprimer le fichier temporaire
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        await sendMessage(senderId, "Une erreur s'est produite lors du traitement de votre requête.");
    }
};

// Informations sur la commande
module.exports.info = {
    name: "removebg",  // Le nom de la commande
    description: "Supprime l'arrière-plan d'une image. Envoyez simplement une image pour l'utiliser.",  // Description de la commande
    usage: "Envoyez une image avec 'removebg' pour supprimer son arrière-plan."  // Comment utiliser la commande
};
