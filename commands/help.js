const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Show available commands',
  author: 'System',
  execute(senderId, args, pageAccessToken, sendMessage) {
    // ID de l'administrateur autorisé
    const adminId = '100041841881488'; // Remplacez par l'ID réel de l'administrateur

    // Affichage du senderId pour debug
    console.log("Sender ID:", senderId);

    // Vérification si l'utilisateur est l'administrateur
    if (senderId !== adminId) {
      sendMessage(senderId, { text: "You don't have permission to use this command." }, pageAccessToken);
      return;
    }

    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    const commands = commandFiles.map(file => {
      const command = require(path.join(commandsDir, file));
      return `⟿ ${command.name}\n  - ${command.description}\n  - Credits: ${command.author}`;
    });

    const totalCommands = commandFiles.length;
    const helpMessage = `Here are the available commands: \nTotal commands: ${totalCommands} \n\n${commands.join('\n\n')}`;

    sendMessage(senderId, { text: helpMessage }, pageAccessToken);
  }
};
