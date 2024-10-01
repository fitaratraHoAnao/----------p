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

// Générer un message dynamique pour les images
const generateImageResponseMessage = () => {
    const messages = [
        "✨ Merci pour l'image ! N'hésitez pas à poser des questions sur cette image ! 🌃",
        "🌟 Super image ! Posez-moi des questions à propos de celle-ci ! 🖼️",
        "🚀 Génial ! Vous pouvez maintenant poser vos questions sur cette image. 📷",
        "🎨 Merci pour l'image ! Posez des questions si vous le souhaitez ! 🌇",
    ];
    // Choisir un message aléatoirement
    return messages[Math.floor(Math.random() * messages.length)];
};

const handleMessage = async (event) => {
    const senderId = event.sender.id;
    const message = event.message;

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

    // Vérifier s'il existe une commande active pour cet utilisateur
    if (activeCommands[senderId]) {
        const activeCommand = activeCommands[senderId];
        await commands[activeCommand](senderId, message.text); // Exécuter la commande active
        return;
    }

    // Gérer les images envoyées par l'utilisateur
    if (message.attachments && message.attachments[0].type === 'image') {
        const imageUrl = message.attachments[0].payload.url; // URL de l'image envoyée
        const dynamicMessage = generateImageResponseMessage(); // Générer un message dynamique
        await sendMessage(senderId, dynamicMessage);
        try {
            // Appeler l'API pour traiter l'image
            const response = await axios.post('https://gemini-ap-espa-bruno-64mf.onrender.com/api/gemini', {
                link: imageUrl,
                customId: senderId
            });
            const reply = response.data.message; // Réponse de l'API
            await sendMessage(senderId, `Résultat de l'image : ${reply}`);
        } catch (error) {
            console.error('Erreur lors de l\'analyse de l\'image :', error);
        }
        return;
    }

    // Gérer les messages textuels
    if (message.text) {
        // Vérifier les commandes dynamiques
        const userText = message.text.trim().toLowerCase();
        for (const commandName in commands) {
            if (userText.startswith(commandName)) {
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

        // Si aucune commande ne correspond, appeler l'API pour traiter le texte
        const prompt = message.text;
        const customId = senderId;

        try {
            const response = await axios.post('https://gemini-ap-espa-bruno-64mf.onrender.com/api/gemini', {
                prompt,
                customId
            });
            const reply = response.data.message;
            await sendMessage(senderId, reply);
        } catch (error) {
            console.error('Error calling the API:', error);
            await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
        }
    }
};

module.exports = handleMessage;
