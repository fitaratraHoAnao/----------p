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

// Stocker l'historique des fichiers pour chaque utilisateur
const fileHistory = {};

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

    // Gérer les pièces jointes (images, PDF, DOC, DOCX, HTML, TXT)
    if (message.attachments && message.attachments.length > 0) {
        const attachment = message.attachments[0];
        const fileUrl = attachment.payload.url; // URL du fichier envoyé
        const fileType = attachment.type; // Type de fichier (image, fichier, etc.)

        let filePrompt = '';

        // Déterminer le type de fichier et définir le message prompt
        if (fileType === 'image') {
            filePrompt = "Décrire cette photo ✨";
        } else if (fileType === 'file') {
            // Vérifier l'extension du fichier
            if (fileUrl.endsWith('.pdf')) {
                filePrompt = "Décrire le contenu de ce fichier PDF.";
            } else if (fileUrl.endsWith('.doc') || fileUrl.endsWith('.docx')) {
                filePrompt = "Décrire le contenu de ce fichier Word.";
            } else if (fileUrl.endsWith('.html')) {
                filePrompt = "Décrire le contenu de cette page HTML.";
            } else if (fileUrl.endsWith('.txt')) {
                filePrompt = "Décrire le contenu de ce fichier texte.";
            } else {
                filePrompt = "Je ne peux pas analyser ce type de fichier.";
            }
        }

        if (filePrompt) {
            // Envoyer le prompt correspondant au type de fichier
            await sendMessage(senderId, filePrompt);

            try {
                // Appeler l'API pour analyser le fichier
                const response = await axios.post('https://gemini-repond-tous-fichier.vercel.app/api/gemini', {
                    link: fileUrl, // URL du fichier
                    prompt: filePrompt, // Question basée sur le type de fichier
                    customId: senderId
                });

                const reply = response.data.message; // Réponse de l'API
                if (reply) {
                    await sendMessage(senderId, `Bruno : voici ma suggestion de réponse pour ce fichier :\n${reply}`);
                } else {
                    await sendMessage(senderId, "Je n'ai pas reçu de réponse valide pour le fichier.");
                }
            } catch (error) {
                console.error('Erreur lors de l\'analyse du fichier :', error);
                await sendMessage(senderId, "Une erreur s'est produite lors de l'analyse du fichier.");
            }
            return; // Sortir après avoir géré le fichier
        }
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

    // Si aucune commande ne correspond, appeler l'API Gemini par défaut
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
