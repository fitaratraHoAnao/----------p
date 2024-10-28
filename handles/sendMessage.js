const axios = require('axios');

const sendMessage = async (recipientId, messageContent) => {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    let messageData;

    if (typeof messageContent === 'string') {
        messageData = {
            recipient: { id: recipientId },
            message: { text: messageContent }
        };
    } else if (messageContent.attachment) {
        messageData = {
            recipient: { id: recipientId },
            message: { attachment: messageContent.attachment }
        };
    } else if (messageContent.files && messageContent.files.length > 0) {
        const fileType = messageContent.type || 'image';
        messageData = {
            recipient: { id: recipientId },
            message: {
                attachment: {
                    type: fileType,
                    payload: { url: messageContent.files[0], is_reusable: true }
                }
            }
        };
    } else {
        console.error('Contenu du message non valide.');
        return;
    }

    try {
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
