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
        await sendMessage(senderId, "Merci pour l'image ! Un instant pendant que je la traite...");
        try {
            // Sauvegarder l'image dans l'historique pour cet utilisateur
            imageHistory[senderId] = imageUrl;

            // Appeler l'API pour traiter l'image
            const response = await axios.post('https://gemini-ap-espa-bruno-64mf.onrender.com/api/gemini', {
                link: imageUrl,
                customId: senderId
            });
            const reply = response.data.message; // Réponse de l'API
            await sendMessage(senderId, `Résultat de l'image : ${reply}`);
        } catch (error) {
            console.error('Erreur lors de l\'analyse de l\'image :', error);
            await sendMessage(senderId, 'Désolé, je n\'ai pas pu traiter l\'image.');
        }
        return;
    }

    // Gérer les messages textuels
    if (message.text) {
        // Vérifier s'il y a une image dans l'historique pour cet utilisateur
        const imageUrl = imageHistory[senderId];

        // Si une image est dans l'historique et que l'utilisateur pose une question, traiter la question avec l'image
        if (imageUrl) {
            const prompt = message.text;
            const customId = senderId;

            try {
                // Appeler l'API pour traiter la question en tenant compte de l'image
                const response = await axios.post('https://gemini-ap-espa-bruno-64mf.onrender.com/api/gemini', {
                    prompt,
                    customId,
                    link: imageUrl // Envoyer l'image avec la question
                });
                const reply = response.data.message;
                await sendMessage(senderId, reply);
            } catch (error) {
                console.error('Error calling the API:', error);
                await sendMessage(senderId, 'Désolé, une erreur s\'est produite lors du traitement de votre message.');
            }
        } else {
            // Si aucune image n'est présente, traiter le texte seul
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
    }
};

module.exports = handleMessage;
