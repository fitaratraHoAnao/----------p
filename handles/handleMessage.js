const fs = require('fs-extra');
const path = require('path');
const sendMessage = require('./sendMessage'); // Assurez-vous que ce fichier existe
const axios = require('axios');

// Charger toutes les commandes du dossier 'commands'
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};

// 状态 de pagination global pour être accessible dans ce module
const userPaginationStates = {};

// Charger les commandes dans un objet
for (const file of commandFiles) {
    const commandName = file.replace('.js', '');
    commands[commandName] = require(`../commands/${file}`);

    // Si c'est la commande help, récupérer son état de pagination
    if (commandName === 'help' && commands[commandName].userPaginationStates) {
        Object.assign(userPaginationStates, commands[commandName].userPaginationStates);
    }
}

console.log('Les commandes suivantes ont été chargées :', Object.keys(commands));

const activeCommands = {};
const imageHistory = {};
const MAX_MESSAGE_LENGTH = 2000; // Limite de caractères pour chaque message envoyé

// Fonction pour envoyer des messages longs en plusieurs parties si nécessaire
async function sendLongMessage(senderId, message) {
    const MAX_MESSAGE_LENGTH = 2000; // Limite de caractères par message Facebook
    
    if (message.length <= MAX_MESSAGE_LENGTH) {
        // Si le message est assez court, l'envoyer directement
        await sendMessage(senderId, message);
        return;
    }
    
    // Diviser le message en plusieurs parties
    for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        const messagePart = message.substring(i, Math.min(i + MAX_MESSAGE_LENGTH, message.length));
        await sendMessage(senderId, messagePart);
        await new Promise(resolve => setTimeout(resolve, 1000));  // Pause de 1s entre chaque message
    }
}

// Fonction pour détecter les mots-clés d'exercice
function detectExerciseKeywords(text) {
    const keywords = ["calculer", "exercices", "1)", "2)", "3)", "a)", "b)", "c)", "d)", "?"];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
}

// Gestion des messages entrants
const handleMessage = async (event, api) => {
    const senderId = event.sender.id;
    const message = event.message;

    // Message d'attente simple sans bloquer le traitement
    const typingMessage = "🇲🇬 ⏳ Generating...";
    sendMessage(senderId, typingMessage).catch(err => console.error("Erreur lors de l'envoi du message d'attente:", err));
    // Pas de délai supplémentaire pour ne pas bloquer le traitement

    // Commande "stop" pour désactiver toutes les commandes persistantes
    if (message.text && message.text.toLowerCase() === 'stop') {
        activeCommands[senderId] = null;
        await sendMessage(senderId, "Toutes les commandes sont désactivées. Vous pouvez maintenant envoyer d'autres messages.");
        return;
    }

    // Si des pièces jointes sont envoyées, gérer les images
    if (message.attachments && message.attachments.length > 0) {
        const imageAttachments = message.attachments.filter(attachment => attachment.type === 'image');

        if (imageAttachments.length > 0) {
            for (const image of imageAttachments) {
                const imageUrl = image.payload.url;

                try {
                    // Historique des images envoyées par l'utilisateur
                    if (!imageHistory[senderId]) {
                        imageHistory[senderId] = [];
                    }
                    imageHistory[senderId].push(imageUrl);

                    // Utiliser l'API OCR pour analyser l'image
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

                    // Demander à l'API de décrire ou résoudre l'exercice
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

    // Texte de l'utilisateur
    const userText = message.text.trim();
    const userTextLower = userText.toLowerCase();

    // Vérifier d'abord si l'utilisateur est en mode pagination pour help
    if (userPaginationStates[senderId] && userPaginationStates[senderId].isActive) {
        // Passer le texte à la commande help pour la navigation
        await commands['help'](senderId, userText);
        return;
    }

    // Si une commande persistante est active pour cet utilisateur
    if (activeCommands[senderId] && activeCommands[senderId] !== 'help') {
        const activeCommand = activeCommands[senderId];
        console.log(`Commande persistante en cours pour ${senderId}: ${activeCommand}`);
        await commands[activeCommand](senderId, userText);
        return;
    }

    // Détecter et exécuter une commande
    for (const commandName in commands) {
        if (userTextLower.startsWith(commandName)) {
            console.log(`Commande détectée : ${commandName}`);
            const commandPrompt = userText.replace(commandName, '').trim();

            if (commandName === 'help') {
                // La commande help est exécutée avec les arguments fournis
                await commands[commandName](senderId, commandPrompt);
                activeCommands[senderId] = null; // Désactivation automatique
                return;
            } else {
                // Activer une commande persistante
                activeCommands[senderId] = commandName;
                await commands[commandName](senderId, commandPrompt);
                return;
            }
        }
    }

    // Si aucune commande n'est active ou détectée, utiliser Gemini pour traiter le texte
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
