const fs = require('fs');
const path = require('path');
const sendMessage = require('./sendMessage');
const axios = require('axios');

// Lire et importer dynamiquement toutes les commandes
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};
for (const file of commandFiles) {
    const commandName = file.replace('.js', '');
    commands[commandName] = require(`../commands/${file}`);
}

console.log('Les commandes suivantes ont été chargées :', Object.keys(commands));

// Stocker les commandes actives et historique
const activeCommands = {};
const fileHistory = {}; // Nouveau pour suivre les fichiers envoyés

const handleMessage = async (event, api) => {
    const senderId = event.sender.id;
    const message = event.message;

    if (message.text) {
        await api.setMessageReaction("✅", event.messageID, true);
    }

    const typingMessage = "🇲🇬 *Bruno* rédige sa réponse... un instant, s'il vous plaît 🍟";
    await sendMessage(senderId, typingMessage);

    await new Promise(resolve => setTimeout(resolve, 2000));

    if (message.text && message.text.toLowerCase() === 'stop') {
        activeCommands[senderId] = null;
        await sendMessage(senderId, "Toutes les commandes sont désactivées. Vous pouvez maintenant envoyer d'autres messages.");
        return;
    }

    if (message.attachments && message.attachments[0]) {
        const attachment = message.attachments[0];
        const fileUrl = attachment.payload.url;
        const fileType = attachment.type;

        let prompt;
        if (fileType === 'image') {
            prompt = "Décrire cette photo";
        } else if (fileType === 'file') {
            const extension = fileUrl.split('.').pop().toLowerCase();
            if (['pdf', 'docx', 'doc', 'html', 'txt'].includes(extension)) {
                prompt = `Analyser le contenu de ce fichier ${extension.toUpperCase()}`;
            } else {
                await sendMessage(senderId, "Le type de fichier n'est pas pris en charge.");
                return;
            }
        }

        try {
            fileHistory[senderId] = fileUrl;

            const response = await axios.post('https://gemini-repond-tous-fichier.vercel.app/api/gemini', {
                link: fileUrl,
                prompt,
                customId: senderId
            });

            const reply = response.data.message;
            if (reply) {
                await sendMessage(senderId, `Bruno : voici ma suggestion pour ce fichier :\n${reply}`);
            } else {
                await sendMessage(senderId, "Je n'ai pas reçu de réponse valide pour ce fichier.");
            }
        } catch (error) {
            console.error('Erreur lors de l\'analyse du fichier :', error);
            await sendMessage(senderId, "Une erreur s'est produite lors de l'analyse du fichier.");
        }
        return;
    }

    // Gestion des commandes actives
    if (activeCommands[senderId] && activeCommands[senderId] !== 'menu') {
        const activeCommand = activeCommands[senderId];
        await commands[activeCommand](senderId, message.text);
        return;
    }

    // Gestion des commandes dynamiques
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

    // Appel à l'API par défaut
    const prompt = message.text;
    const customId = senderId;

    try {
        const response = await axios.post('https://gemini-repond-tous-fichier.vercel.app/api/gemini', {
            prompt,
            customId
        });
        const reply = response.data.message;
        await sendMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
    }
};

module.exports = handleMessage;
