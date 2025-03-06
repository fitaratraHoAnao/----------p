const axios = require('axios');

// Fonction pour envoyer un message à un utilisateur de Facebook
const sendMessage = async (recipientId, messageText) => {
    // Ajouter des logs de débogage
    console.log(`Tentative d'envoi d'un message à ${recipientId}, longueur: ${messageText.length} caractères`);
    try {
        const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
        const MAX_MESSAGE_LENGTH = 2000; // Limite maximale autorisée par Facebook

        let messageData;

        if (typeof messageText === 'string') {
            // Vérifier et limiter la longueur du message
            const truncatedText = messageText.length > MAX_MESSAGE_LENGTH 
                ? messageText.substring(0, MAX_MESSAGE_LENGTH - 3) + "..." 
                : messageText;
                
            messageData = {
                recipient: { id: recipientId },
                message: { text: truncatedText }
            };
        } else if (messageText.attachment) {
            messageData = {
                recipient: { id: recipientId },
                message: { attachment: messageText.attachment }
            };
        } else if (messageText.files && messageText.files.length > 0) {
            const fileType = messageText.type || 'image';
            messageData = {
                recipient: { id: recipientId },
                message: {
                    attachment: {
                        type: fileType,
                        payload: { url: messageText.files[0], is_reusable: true }
                    }
                }
            };
        } else {
            console.error('Contenu du message non valide.');
            return;
        }

        const response = await axios.post(
            `https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
            messageData
        );
        console.log('Message envoyé avec succès:', response.data);
    } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error.response ? error.response.data : error.message);
    }
};

module.exports = sendMessage;
