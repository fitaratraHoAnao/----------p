const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, prompt) => {
    try {
        // Envoyer un message de confirmation que le message a été reçu
        await sendMessage(senderId, "Message reçu, je prépare une correction...");

        const query = prompt || "hi"; // Utiliser le prompt ou une requête par défaut
        const userId = senderId; // ID de l'utilisateur

        const header = "(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠) | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n・──────────────・";
        const footer = "・───── >ᴗ< ──────・";

        // Vérifier s'il y a des pièces jointes d'image dans le message d'origine
        if (message.messageReply && message.messageReply.attachments && message.messageReply.attachments[0]?.type === "photo") {
            const attachment = message.messageReply.attachments[0];
            const imageURL = attachment.url;

            // Construire l'URL pour appeler l'API de reconnaissance d'image
            const geminiUrl = `https://joncll.serv00.net/chat.php?ask=${encodeURIComponent(query)}&imgurl=${encodeURIComponent(imageURL)}`;
            try {
                const response = await axios.get(geminiUrl);
                const { vision } = response.data;

                if (vision) {
                    // Envoyer la réponse de vision/image à l'utilisateur
                    return await sendMessage(senderId, `${header}\n${vision}\n${footer}`);
                } else {
                    // Envoyer un message d'erreur si la reconnaissance d'image échoue
                    return await sendMessage(senderId, `${header}\nÉchec de la reconnaissance de l'image.\n${footer}`);
                }
            } catch (error) {
                console.error("Erreur lors de la reconnaissance d'image :", error);
                return await sendMessage(senderId, `${header}\nUne erreur est survenue lors du traitement de l'image.\n${footer}`);
            }
        }

        // Gérer les requêtes textuelles en utilisant l'API GPT-4
        try {
            const { data } = await axios.get(`https://lorex-gpt4.onrender.com/api/gpt4?prompt=${encodeURIComponent(query)}&uid=${userId}`);

            if (data && data.response) {
                // Envoyer la réponse GPT-4 à l'utilisateur
                await sendMessage(senderId, `${header}\n${data.response}\n${footer}`);
            } else {
                // Envoyer un message d'erreur si la réponse de l'API est vide
                await sendMessage(senderId, `${header}\nDésolé, je n'ai pas pu obtenir de réponse de l'API.\n${footer}`);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel à l'API GPT-4 :", error);
            await sendMessage(senderId, `${header}\nUne erreur est survenue lors de la communication avec l'API.\n${footer}`);
        }
    } catch (error) {
        console.error('Erreur lors du traitement de la requête:', error);

        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "bot",  // Le nom de la commande pour la correction orthographique
    description: "Permet de discuter avec le bot, qui peut répondre à vos questions ou traiter des images pour reconnaissance.",  // Description de la commande
    usage: "Envoyez 'bot <message>' pour poser une question ou 'bot <image>' pour analyser une image."  // Comment utiliser la commande
};
