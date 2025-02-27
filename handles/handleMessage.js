const fs = require('fs-extra');
const path = require('path');
const sendMessage = require('./sendMessage'); // Assurez-vous que ce fichier existe
const axios = require('axios');

// Charger toutes les commandes du dossier 'commands'
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};

// Charger les commandes dans un objet
for (const file of commandFiles) {
    const commandName = file.replace('.js', '');
    commands[commandName] = require(`../commands/${file}`);
}

console.log('Les commandes suivantes ont été chargées :', Object.keys(commands));

const activeCommands = {};
const imageHistory = {};
const MAX_MESSAGE_LENGTH = 2000; // Limite de caractères pour chaque message envoyé

// Fonction pour envoyer des messages longs en plusieurs parties si nécessaire
async function sendLongMessage(senderId, message) {
    for (let i = 0; i < message.length; i += MAX_MESSAGE_LENGTH) {
        const messagePart = message.substring(i, i + MAX_MESSAGE_LENGTH);
        await sendMessage(senderId, messagePart);
        await new Promise(resolve => setTimeout(resolve, 500));  // Pause de 500ms entre chaque message
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

    // Message d'attente pendant le traitement
    const typingMessage = "🇲🇬 🔍 Generating...🍏";
    await sendMessage(senderId, typingMessage);
    await new Promise(resolve => setTimeout(resolve, 2000));

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

                    // Message pour indiquer le traitement en cours
                    await sendMessage(senderId, "🔍 Analyse de l'image en cours...");

                    // Utiliser l'API OCR pour analyser l'image avec un timeout
                    const ocrResponse = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
                        link: imageUrl,
                        prompt: "Analyse du texte de l'image pour détection de mots-clés",
                        customId: senderId
                    }, { timeout: 30000 }); // Timeout de 30 secondes

                    if (!ocrResponse.data || !ocrResponse.data.message) {
                        throw new Error("Réponse OCR invalide");
                    }

                    const ocrText = ocrResponse.data.message;
                    const hasExerciseKeywords = detectExerciseKeywords(ocrText);

                    const prompt = hasExerciseKeywords
                        ? "Faire cet exercice et donner la correction complète de cet exercice"
                        : "Décrire cette photo";

                    // Message pour indiquer que l'analyse est terminée et que la génération commence
                    await sendMessage(senderId, "✅ Analyse terminée, génération de la réponse en cours...");

                    // Demander à l'API de décrire ou résoudre l'exercice
                    const response = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
                        link: imageUrl,
                        prompt,
                        customId: senderId
                    }, { timeout: 60000 }); // Timeout de 60 secondes

                    if (!response.data || !response.data.message) {
                        throw new Error("Réponse de l'API invalide");
                    }

                    const reply = response.data.message;
                    await sendLongMessage(senderId, `Bruno : voici ma suggestion de réponse pour cette image :\n${reply}`);
                } catch (error) {
                    console.error('Erreur lors de l\'analyse de l\'image :', error);
                    
                    // Message d'erreur détaillé
                    let errorMessage = "Une erreur s'est produite lors de la description de l'image.";
                    
                    if (error.code === 'ECONNABORTED') {
                        errorMessage = "Le délai d'attente a été dépassé. Veuillez réessayer avec une image plus claire ou plus petite.";
                    } else if (error.response) {
                        errorMessage += ` (Code: ${error.response.status})`;
                        console.error('Réponse d\'erreur:', error.response.data);
                    }
                    
                    await sendMessage(senderId, errorMessage);
                    
                    // Message de suggestion
                    await sendMessage(senderId, "Vous pouvez essayer de renvoyer l'image avec une meilleure qualité ou utiliser une commande texte à la place.");
                }
            }
        } else {
            await sendMessage(senderId, "Aucune image n'a été trouvée dans le message.");
        }
        return;
    }

    // Texte de l'utilisateur
    const userText = message.text.trim().toLowerCase();

    // Si une commande persistante est active pour cet utilisateur
    if (activeCommands[senderId] && activeCommands[senderId] !== 'help') {
        const activeCommand = activeCommands[senderId];
        console.log(`Commande persistante en cours pour ${senderId}: ${activeCommand}`);
        await commands[activeCommand](senderId, userText);
        return;
    }

    // Détecter et exécuter une commande
    for (const commandName in commands) {
        if (userText.startsWith(commandName)) {
            console.log(`Commande détectée : ${commandName}`);
            const commandPrompt = userText.replace(commandName, '').trim();

            if (commandName === 'help') {
                // La commande help est exécutée mais ne devient pas persistante
                await commands[commandName](senderId);
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
