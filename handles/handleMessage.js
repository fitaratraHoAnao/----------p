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
    if (message.attachments && message.attachments[0].type === 'image') {
        const imageUrl = message.attachments[0].payload.url; // URL de l'image envoyée
        await sendMessage(senderId, "✨ Merci pour l'image ! Posez des questions si vous le souhaitez ! 🌇");

        try {
            // Sauvegarder l'image dans l'historique pour cet utilisateur
            imageHistory[senderId] = imageUrl;

            // Appeler la première méthode de l'API Gemini
            const responseMethod1 = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
                link: imageUrl,
                customId: senderId
            });
            const replyMethod1 = responseMethod1.data.message; // Réponse de la première méthode

            // Appeler la deuxième méthode de l'API (même API ou une API différente mais pour obtenir un résultat similaire)
            const responseMethod2 = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini_v2', {
                link: imageUrl,
                customId: senderId
            });
            const replyMethod2 = responseMethod2.data.message; // Réponse de la deuxième méthode

            // Vérifier si les deux réponses sont valides et les envoyer séparément à l'utilisateur
            if (replyMethod1) {
                await sendMessage(senderId, `Bot (Méthode 1): Voici la réponse avec la première méthode:\n${replyMethod1}`);
            } else {
                await sendMessage(senderId, 'Je n\'ai pas reçu de réponse valide pour l\'image avec la première méthode.');
            }

            if (replyMethod2) {
                await sendMessage(senderId, `Bot (Méthode 2): Voici la réponse avec la deuxième méthode:\n${replyMethod2}`);
            } else {
                await sendMessage(senderId, 'Je n\'ai pas reçu de réponse valide pour l\'image avec la deuxième méthode.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'analyse de l\'image :', error);
            // Ne rien faire ici pour éviter d'envoyer un message d'erreur après le message de remerciement
        }
        return; // Sortir après avoir géré l'image
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
        // Appel de la première méthode de l'API pour le prompt
        const responseMethod1 = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini', {
            prompt,
            customId
        });
        const replyMethod1 = responseMethod1.data.message;

        // Appel de la deuxième méthode (par exemple, une version différente de l'API)
        const responseMethod2 = await axios.post('https://gemini-sary-prompt-espa-vercel-api.vercel.app/api/gemini_v2', {
            prompt,
            customId
        });
        const replyMethod2 = responseMethod2.data.message;

        // Envoi des réponses de chaque méthode
        if (replyMethod1) {
            await sendMessage(senderId, `Bot (Méthode 1): Voici la réponse avec la première méthode:\n${replyMethod1}`);
        }

        if (replyMethod2) {
            await sendMessage(senderId, `Bot (Méthode 2): Voici la réponse avec la deuxième méthode:\n${replyMethod2}`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API :', error);
        await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
    }
};

module.exports = handleMessage;
