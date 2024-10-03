const axios = require('axios');  // Utilisation d'axios pour les requêtes HTTP
const sendMessage = require('../handles/sendMessage'); // Fonction pour envoyer des messages à l'utilisateur

// Fonction pour récupérer les données d'un pays par nom
const getCountryDataByName = async (senderId, countryName) => {
    try {
        // Appel à l'API Rest Countries pour obtenir les données du pays spécifié
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
        const country = response.data[0];  // On prend le premier résultat correspondant
        
        // Extrait des informations clés sur le pays
        const commonName = country.name.common;
        const officialName = country.name.official;
        const capital = country.capital ? country.capital[0] : 'N/A';
        const region = country.region;
        const language = Object.values(country.languages || {}).join(', ');
        const currency = country.currencies 
            ? Object.values(country.currencies)[0].name 
            : 'N/A';
        
        // Message à envoyer à l'utilisateur
        const message = `
🌍 **Pays** : ${commonName} (${officialName})
🏙️ **Capitale** : ${capital}
🌍 **Région** : ${region}
🗣️ **Langue(s)** : ${language}
💰 **Monnaie** : ${currency}
        `;

        // Envoi du message avec les informations du pays
        await sendMessage(senderId, message);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Rest Countries:", error);
        await sendMessage(senderId, `Désolé, je n'ai pas trouvé le pays "${countryName}".`);
    }
};

// Commande principale qui écoute le mot-clé 'country' suivi du nom du pays
module.exports = async (senderId, userText) => {
    const args = userText.trim().toLowerCase().split(' ');
    
    // Vérifie si la commande est 'country'
    if (args[0] === 'country') {
        // Si l'utilisateur a spécifié un pays
        if (args[1]) {
            const countryName = args.slice(1).join(' '); // Récupère tout ce qui suit 'country' comme nom du pays
            await getCountryDataByName(senderId, countryName); // Appel de la fonction pour récupérer les infos du pays
        } else {
            // Si l'utilisateur n'a pas spécifié de pays, on lui demande d'en fournir un
            await sendMessage(senderId, 'Veuillez spécifier un pays après "country". Exemple: "country France".');
        }
    }
};

// Informations de la commande
module.exports.info = {
    name: "country",  // Nom de la commande
    description: "Obtenez des informations sur un pays spécifique.",  // Description
    usage: "Envoyez 'country [nom du pays]' pour obtenir des informations sur un pays."  // Instructions
};
