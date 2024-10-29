const fs = require('fs');
const path = require('path');
const sendMessage = require('./sendMessage');
const axios = require('axios');

// Charger les commandes
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};

for (const file of commandFiles) {
    const commandName = file.replace('.js', '');
    commands[commandName] = require(`../commands/${file}`);
}

console.log('Les commandes suivantes ont été chargées :', Object.keys(commands));

const activeCommands = {};
const imageHistory = {};
const MAX_MESSAGE_LENGTH = 2000; // Limite de caractères pour chaque message envoyé

// Structure des permissions
const userPermissions = {
    "61562826406367": "authorized", // Utilisateur autorisé
};

const ADMIN_UID = "100029553424992"; // Remplacez par votre propre UID

// Fonction pour envoyer des messages longs
async function sendLongMessage(senderId, message) {
    for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        const messagePart = message.substring(i, i + MAX_MESSAGE_LENGTH);
        await sendMessage(senderId, messagePart);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Détecter les mots-clés pour les exercices
function detectExerciseKeywords(text) {
    const keywords = ["exercice", "calculer", "1)", "2)", "a)", "b)", "c)", "d)", "?"];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Gérer les messages entrants
const handleMessage = async (event, api) => {
    const senderId = event.sender.id;
    const message = event.message;

    // Vérifiez si l'utilisateur est autorisé
    const permissionStatus = userPermissions[senderId] || "unauthorized";

    // Si l'utilisateur est l'administrateur, lui donner tous les droits
    if (senderId === ADMIN_UID) {
        await api.setMessageReaction("✅", event.messageID, true);
    } else if (permissionStatus === "unauthorized") {
        await sendMessage(senderId, "Vous n'avez pas l'autorisation d'utiliser ce bot.");
        return; // Ne pas traiter d'autres messages si non autorisé
    }

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

    if (message.attachments && message.attachments.length > 0) {
        const imageAttachments = message.attachments.filter(attachment => attachment.type === 'image');

        if (imageAttachments.length > 0) {
            for (const image of imageAttachments) {
                const imageUrl = image.payload.url;

                try {
                    if (!imageHistory[senderId]) {
                        imageHistory[senderId] = [];
                    }
                    imageHistory[senderId].push(imageUrl);

                    const ocrResponse = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
                        link: imageUrl,
                        prompt: "Analyse du texte de l'image pour détection de mots-clés",
                        customId: senderId
                    });

                    const ocrText = ocrResponse.data.message || "";
                    const hasExerciseKeywords = detectExerciseKeywords(ocrText);

                    const prompt = hasExerciseKeywords
                        ? "Faire cet exercice et donner la correction complète de cet exercice"
                        : "Décrire cette photo";

                    const response = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
                        link: imageUrl,
                        prompt,
                        customId: senderId
                    });

                    const reply = response.data.message;

                    if (reply) {
                        await sendLongMessage(senderId, `Bruno : voici ma suggestion de réponse pour cette image :\n${reply}`);
                    } else {
                        await sendMessage(senderId, "Je n'ai pas reçu de réponse valide pour l'image.");
                    }
                } catch (error) {
                    console.error('Erreur lors de l\'analyse de l\'image :', error.response ? error.response.data : error.message);
                    await sendMessage(senderId, "Une erreur s'est produite lors de la description de l'image.");
                }
            }
        } else {
            await sendMessage(senderId, "Aucune image n'a été trouvée dans le message.");
        }
        return;
    }

    if (activeCommands[senderId] && activeCommands[senderId] !== 'menu') {
        const activeCommand = activeCommands[senderId];
        await commands[activeCommand](senderId, message.text);
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
            prompt,
            customId
        });
        const reply = response.data.message;
        await sendLongMessage(senderId, reply);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
    }
};

// Fonction pour mettre à jour les permissions
const updatePermission = (userId, permission) => {
    userPermissions[userId] = permission;
};

// Gérer les commandes spéciales pour l'administrateur
const adminCommands = async (senderId, message) => {
    const userText = message.trim().toLowerCase();

    if (userText.startsWith('setPermission')) {
        const [_, userId, permission] = userText.split(' ');
        updatePermission(userId, permission);
        await sendMessage(senderId, `Permission pour ${userId} mise à jour en ${permission}.`);
    }

    if (userText === 'listPermissions') {
        const userList = Object.entries(userPermissions)
            .map(([uid, permission]) => `${uid}: ${permission}`)
            .join('\n');
        await sendLongMessage(senderId, `Liste des utilisateurs et permissions :\n${userList}`);
    }
};

// Exporter la fonction handleMessage
module.exports = handleMessage;
