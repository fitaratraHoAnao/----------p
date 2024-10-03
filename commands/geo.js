const axios = require('axios');  // Utilisation d'axios pour les requêtes HTTP
const sendMessage = require('../handles/sendMessage'); // Fonction pour envoyer des messages à l'utilisateur

// Fonction pour récupérer les données géographiques de l'adresse IP de l'utilisateur
const getGeoDataByIP = async (senderId) => {
    try {
        // Appel à l'API GeoJS pour obtenir les informations géographiques de l'IP
        const response = await axios.get(`https://get.geojs.io/v1/ip/geo.json`);
        const geoData = response.data;
        
        // Extrait des informations clés
        const city = geoData.city || 'Inconnue';
        const country = geoData.country || 'Inconnu';
        const latitude = geoData.latitude || 'Non disponible';
        const longitude = geoData.longitude || 'Non disponible';
        const timezone = geoData.timezone || 'Non disponible';
        const ip = geoData.ip || 'Inconnue';
        const organization = geoData.organization_name || 'Non disponible';

        // Message à envoyer à l'utilisateur
        const message = `
🌍 **Votre localisation basée sur l'IP** :
📍 **Ville** : ${city}
🌍 **Pays** : ${country}
🌐 **Latitude** : ${latitude}
🌐 **Longitude** : ${longitude}
🕒 **Fuseau horaire** : ${timezone}
🌐 **IP** : ${ip}
🏢 **Organisation** : ${organization}
        `;

        // Envoi du message avec les informations géographiques
        await sendMessage(senderId, message);
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API GeoJS:", error);
        await sendMessage(senderId, `Désolé, je n'ai pas pu récupérer vos informations géographiques.`);
    }
};

// Commande principale qui écoute le mot-clé 'geo'
module.exports = async (senderId, userText) => {
    const args = userText.trim().toLowerCase().split(' ');
    
    // Vérifie si la commande est 'geo'
    if (args[0] === 'geo') {
        await getGeoDataByIP(senderId); // Appel de la fonction pour récupérer les infos géographiques
    } else {
        // Si la commande n'est pas reconnue, un message par défaut est envoyé
        await sendMessage(senderId, 'Pour obtenir vos informations géographiques, envoyez "geo".');
    }
};

// Informations de la commande
module.exports.info = {
    name: "geo",  // Nom de la commande
    description: "Obtenez vos informations géographiques basées sur votre adresse IP.",  // Description
    usage: "Envoyez 'geo' pour obtenir vos informations géographiques."  // Instructions
};
