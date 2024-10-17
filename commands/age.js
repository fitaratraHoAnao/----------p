const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText) => {
    // Ajout d'un log pour vérifier ce que le bot reçoit comme texte utilisateur
    console.log('Texte utilisateur reçu:', userText);

    // Extraire le texte après le préfixe 'age' et en supprimer les espaces superflus
    const args = userText.trim().split(/\s+/).slice(1); // Supprimer tous les espaces superflus entre les mots
    const birthday = args[0]; // Le premier argument après 'age' est la date de naissance

    // Ajout d'un log pour vérifier ce que le bot extrait comme date de naissance
    console.log('Date de naissance extraite:', birthday);

    // Vérifier si l'utilisateur a bien fourni une date
    if (!birthday) {
        return sendMessage(senderId, "Please provide your birthday in YYYY-MM-DD format.");
    }

    const currentDate = new Date();
    const birthDate = new Date(birthday);

    // Vérifier si la date est valide
    if (isNaN(birthDate.getTime())) {
        return sendMessage(senderId, "Invalid date format. Please use YYYY-MM-DD.");
    }

    // Calculer l'âge
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
