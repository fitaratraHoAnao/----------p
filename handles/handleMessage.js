const fs = require('fs');
const path = require('path');
const sendMessage = require('./sendMessage');
const axios = require('axios');

// Lire et importer dynamiquement toutes les commandes dans le répertoire "commands"
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
const commands = {};

// Charger chaque commande en tant que module
for (const file of commandFiles) {
    const commandName = file.replace('.js', ''); // Retirer l'extension .js pour obtenir le nom de la commande
    commands[commandName] = require(`../commands/${file}`); // Importer le fichier de commande
}

console.log('Les commandes suivantes ont été chargées :', Object.keys(commands));

// Stocker les commandes actives pour chaque utilisateur
const activeCommands = {};

// Stocker l'historique de l'image pour chaque utilisateur
const imageHistory = {};
const userVideos = {}; // Stocker les vidéos pour chaque utilisateur

const handleMessage = async (event, api) => {
    const senderId = event.sender.id;
    const message = event.message;

    // Réagir au message avec l'emoji ✅
    if (message.text) {
        await api.setMessageReaction("✅", event.messageID, true);  // Réaction automatique ✅
    }

    // Message d'attente
    const typingMessage = "🇲🇬 *Bruno* rédige sa réponse... un instant, s'il vous plaît 🍟";
    await sendMessage(senderId, typingMessage); // Envoyer le message d'attente

    // Ajouter un délai de 2 secondes
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Si l'utilisateur envoie "stop", désactiver la commande active
    if (message.text && message.text.toLowerCase() === 'stop') {
        activeCommands[senderId] = null;
        await sendMessage(senderId, "Toutes les commandes sont désactivées. Vous pouvez maintenant envoyer d'autres messages.");
        return;
    }

    // Gérer les images envoyées par l'utilisateur
    if (message.attachments && message.attachments.length > 0) {
        const imageAttachments = message.attachments.filter(attachment => attachment.type === 'image');

        if (imageAttachments.length > 0) {
            // Boucle sur chaque image envoyée par l'utilisateur
            for (const image of imageAttachments) {
                const imageUrl = image.payload.url; // URL de l'image envoyée

                // Envoyer la question prédéfinie pour chaque image
                await sendMessage(senderId, "Décrire cette photo ✨");

                try {
                    // Sauvegarder l'image dans l'historique pour cet utilisateur
                    if (!imageHistory[senderId]) {
                        imageHistory[senderId] = [];
                    }
                    imageHistory[senderId].push(imageUrl);

                    // Appeler l'API pour décrire l'image
                    const response = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
                        link: imageUrl, // URL de l'image
                        prompt: "Décrire cette photo", // Question prédéfinie
                        customId: senderId
                    });

                    const reply = response.data.message; // Réponse de l'API

                    // Envoyer la réponse pour chaque image
                    if (reply) {
                        await sendMessage(senderId, `Bruno : voici ma suggestion de réponse pour cette image :\n${reply}`);
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
        return; // Sortir après avoir géré les images
    }

    // Vérifier s'il existe une commande active pour cet utilisateur (sauf pour la commande "menu")
    if (activeCommands[senderId] && activeCommands[senderId] !== 'menu') {
        const activeCommand = activeCommands[senderId];
        await commands[activeCommand](senderId, message.text); // Exécuter la commande active
        return;
    }

    // Vérifier les commandes dynamiques
    const userText = message.text.trim().toLowerCase();
    for (const commandName in commands) {
        if (userText.startsWith(commandName)) {
            const commandPrompt = userText.replace(commandName, '').trim();

            if (commandName === 'menu') {
                // Ne pas activer la commande "menu" (pas de besoin de "stop" après)
                await commands[commandName](senderId, commandPrompt); // Appeler directement la commande menu
            } else {
                // Activer les autres commandes
                activeCommands[senderId] = commandName; // Activer cette commande pour les futurs messages
                await commands[commandName](senderId, commandPrompt); // Appeler la commande
            }

            return; // Sortir après l'exécution de la commande
        }
    }

    // Vérifier si l'utilisateur a sélectionné une vidéo
    if (userVideos[senderId]) {
        const videoIndex = parseInt(message.text) - 1; // Convertir le texte de l'utilisateur en index (0-based)

        if (videoIndex >= 0 && videoIndex < userVideos[senderId].length) {
            await commands.youtube.handleVideoSelection(senderId, videoIndex); // Appeler la fonction pour gérer la sélection de la vidéo
            return;
        } else {
            await sendMessage(senderId, "Numéro de vidéo invalide. Veuillez choisir un numéro de la liste.");
            return;
        }
    }

    // Si aucune commande ne correspond, appeler l'API Gemini par défaut
    const prompt = message.text;
    const customId = senderId;

    try {
        const response = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
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
