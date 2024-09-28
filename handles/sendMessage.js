const axios = require('axios');

const sendMessage = (recipientId, messageContent) => {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    let messageData;

    // Vérifier si le contenu est une chaîne de texte ou un objet avec des fichiers
    if (typeof messageContent === 'string') {
        messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                text: messageContent
            }
        };
    } else if (messageContent.files && messageContent.files.length > 0) {
        // Si messageContent est un objet avec un tableau de fichiers
        messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: 'image',
                    payload: {
                        url: messageContent.files[0],  // Envoi de la première image
                        is_reusable: true  // Optionnel, permet à l'image d'être réutilisée
                    }
                }
            }
        };
    } else {
        console.error('Contenu du message non valide.');
        return;
    }

    // Envoyer la requête POST à l'API Messenger
    axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
        .then(response => {
            console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
        });
};

module.exports = sendMessage;
