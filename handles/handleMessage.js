const fs = require('fs');
const path = require('path');
const sendMessage = require('./sendMessage');
const axios = require('axios');

// Liste des utilisateurs autorisés par leur UID
const authorizedUsers = ["100041841881488", "100020699087706"];

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

async function sendLongMessage(senderId, message) {
    for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        const messagePart = message.substring(i, i + MAX_MESSAGE_LENGTH);
        await sendMessage(senderId, messagePart);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

function detectExerciseKeywords(text) {
    const keywords = ["exercice", "calculer", "1)", "2)", "a)", "b)", "c)", "d)", "?"];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
}

const handleMessage = async (event, api) => {
    const senderId = event.sender.id;
    const message = event.message;

    // Vérification d'autorisation
    if (!authorizedUsers.includes(senderId)) {
        const subscribeMessage = `Votre période d'essai est terminée. Pour continuer à utiliser le bot, veuillez souscrire un abonnement : 1 000 Ar pour 7 jours ou 4 000 Ar pour un mois. Effectuez votre paiement aux numéros suivants : 033 876 4195 ou 034 697 3333, au nom de Bruno. Merci pour votre confiance ! Une fois l'abonnement réglé, veuillez contacter l'administrateur à ce lien : https://www.facebook.com/bruno.rakotomalala.7549`;
        await sendMessage(senderId, subscribeMessage);
        return; // Arrête l'exécution si l'utilisateur n'est pas autorisé
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

module.exports = handleMessage;

