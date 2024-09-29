const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Extraire le texte après le préfixe 'age' et en supprimer les espaces superflus
    const args = userText.trim().split(' ').slice(1); // Supposons que userText commence par 'ai'
    const birthday = args[0]; // Le premier argument après 'ai' est la date de naissance

    if (!birthday) {
        return sendMessage(senderId, "Please provide your birthday in YYYY-MM-DD format.");
    }

    const currentDate = new Date();
    const birthDate = new Date(birthday);

    if (isNaN(birthDate.getTime())) { // Vérifier si la date est valide
        return sendMessage(senderId, "Invalid date format. Please use YYYY-MM-DD.");
    }

    const age = currentDate.getFullYear() - birthDate.getFullYear();

    birthDate.setFullYear(currentDate.getFullYear());
    const isBeforeBirthday = currentDate < birthDate;

    const finalAge = isBeforeBirthday ? age - 1 : age;

    return sendMessage(senderId, `Your age is ${finalAge}. Am I right?`);
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "age",  // Le nom de la commande
    description: "Envoyer une question ou un sujet pour obtenir une réponse générée par l'IA.",  // Description de la commande
    usage: "Envoyez 'age <votre date de naissance>' pour obtenir votre âge."  // Comment utiliser la commande
};
