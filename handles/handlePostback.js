const sendMessage = require('./sendMessage');

const handlePostback = (event) => {
    const senderId = event.sender.id;
    const payload = event.postback.payload;

    // Traitement de différents types de postbacks
    if (payload === 'GET_STARTED') {
        sendMessage(senderId, "Welcome! Please send me an image to start.");
    } else {
        sendMessage(senderId, "I didn't understand that action.");
    }
};

module.exports = handlePostback;
