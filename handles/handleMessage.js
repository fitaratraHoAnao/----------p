const fs = require('fs');
const path = require('path');
const { sendMessage } = require('./sendMessage');

// Stocker les états d'activation des commandes pour chaque utilisateur
const commandStates = {};
const activeCommands = {};

// Charger tous les modules de commande dynamiquement
const commands = new Map();
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name, command);
}

async function handleMessage(event, pageAccessToken) {
  const senderId = event.sender.id;
  
  // Vérifier si l'événement contient des quick_replies
  if (event.message && event.message.quick_reply) {
    const payload = event.message.quick_reply.payload;
    
    // Traiter le payload (similaire à handlePostback.js)
    switch (payload) {
      case 'traduction fr':
        sendMessage(senderId, { text: 'Vous avez choisi la traduction en Français.' }, pageAccessToken);
        break;
      case 'traduction en':
        sendMessage(senderId, { text: 'You selected translation to English.' }, pageAccessToken);
        break;
      case 'traduction es':
        sendMessage(senderId, { text: 'Has seleccionado la traducción al Español.' }, pageAccessToken);
        break;
      default:
        sendMessage(senderId, { text: `Payload reçu : ${payload}` }, pageAccessToken);
    }

    return; // Arrêter ici pour ne pas traiter cela comme une commande normale
  }

  // Continuer à gérer les commandes texte normalement
  const messageText = event.message.text.toLowerCase().trim();
  commandStates[senderId] = commandStates[senderId] || { active: true };
  activeCommands[senderId] = activeCommands[senderId] || null;

  const args = messageText.split(' ');
  const commandName = args.shift();

  if (commandName === 'stop') {
    commandStates[senderId].active = false;
    activeCommands[senderId] = null;
    return sendMessage(senderId, { text: 'All commands have been stopped.' }, pageAccessToken);
  }

  if (commandName === 'start') {
    commandStates[senderId].active = true;
    return sendMessage(senderId, { text: 'All commands have been started.' }, pageAccessToken);
  }

  if (activeCommands[senderId]) {
    const command = commands.get(activeCommands[senderId]);
    if (command) {
      try {
        await command.execute(senderId, args, pageAccessToken, sendMessage);
      } catch (error) {
        console.error(`Error executing command ${activeCommands[senderId]}:`, error);
        sendMessage(senderId, { text: 'There was an error executing your command.' }, pageAccessToken);
      }
      return;
    }
  }

  if (commandStates[senderId].active) {
    if (commands.has(commandName)) {
      const command = commands.get(commandName);
      activeCommands[senderId] = commandName;
      try {
        await command.execute(senderId, args, pageAccessToken, sendMessage);
      } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        sendMessage(senderId, { text: 'There was an error executing your command.' }, pageAccessToken);
      }
    } else {
      const defaultCommand = commands.get('par');
      if (defaultCommand) {
        try {
          await defaultCommand.execute(senderId, [messageText], pageAccessToken, sendMessage);
        } catch (error) {
          console.error('Error executing default command:', error);
          sendMessage(senderId, { text: 'There was an error processing your message.' }, pageAccessToken);
        }
      }
    }
  } else {
    sendMessage(senderId, { text: 'All commands are currently stopped.' }, pageAccessToken);
  }
}

module.exports = { handleMessage };
