const axios = require('axios');

const sendMessage = (recipientId, messageText) => {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

    const messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText
        }
    };

    axios.post(`https://graph.facebook.com/v16.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
        .then(response => {
            console.log('Message sent successfully:', response.data);
        })
        .catch(error => {
            console.error('Error sending message:', error.response ? error.response.data : error.message);
        });
};

module.exports = sendMessage;
