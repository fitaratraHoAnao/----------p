const fs = require('fs');
const path = require('path');
const sendMessage = require('./sendMessage');
const axios = require('axios');

const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};

for (const file of commandFiles) {
    const commandName = file.replace('.js', '');
    commands[commandName] = require(`../commands/${file}`);
}

const activeCommands = {};
const imageHistory = {};
const MAX_MESSAGE_LENGTH = 2000;

async function sendLongMessage(senderId, message) {
    for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        const messagePart = message.substring(i, i + MAX_MESSAGE_LENGTH);
        await sendMessage(senderId, messagePart);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

const handleMessage = async (event, api) => {
    const senderId = event.sender.id;
    const message = event.message;

    if (message.text && message.text.toLowerCase() === 'stop') {
        activeCommands[senderId] = null;
        await sendMessage(senderId, "Toutes les commandes sont désactivées.");
        return;
    }

    if (message.attachments && message.attachments.length > 0) {
        const imageAttachments = message.attachments.filter(attachment => attachment.type === 'image');
        if (imageAttachments.length > 0) {
            for (const image of imageAttachments) {
                const imageUrl = image.payload.url;
                if (activeCommands[senderId] === 'removebg') {
                    await commands['removebg'](senderId, 'removebg', imageUrl);
                }
            }
        } else {
            await sendMessage(senderId, "Aucune image trouvée dans le message.");
        }
        return;
    }

    const userText = message.text.trim().toLowerCase();
    for (const commandName in commands) {
        if (userText.startsWith(commandName)) {
            const commandPrompt = userText.replace(commandName, '').trim();
            if (commandName === 'menu') {
                await commands[commandName](senderId, commandPrompt);
            } else {
                activeCommands[senderId] = commandName;
                await commands[commandName](senderId, commandPrompt);
            }
            return;
        }
    }

    const prompt = message.text;
    const customId = senderId;
    try {
        const response = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
            prompt, customId
        });
        const reply = response.data.message;
        await sendLongMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite.');
    }
};

module.exports = handleMessage;
