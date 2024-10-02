const moment = require('moment-timezone');
const os = require('os');
const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Assurez-vous de définir le fuseau horaire par défaut
moment.tz.setDefault('Asia/Dhaka');

module.exports = async (senderId) => {
    try {
        // Envoyer un message de confirmation que la requête est en cours
        await sendMessage(senderId, "Je recherche des informations sur les fuseaux horaires...");

        // Vérifier si global.utils est défini
        if (!global.utils || !global.utils.getStreamFromURL) {
            console.error('Erreur: global.utils ou getStreamFromURL n\'est pas défini.');
            await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des informations.");
            return;
        }

        // Charger l'image
        const frog = await global.utils.getStreamFromURL("https://i.ibb.co/kmFdGF6/image.jpg");

        // Obtenir les informations sur le temps
        const now = moment();
        const formattedDate = now.format('YYYY-MM-DD');
        const time = now.format('hh:mm:ss A');

        // Informations sur les fuseaux horaires
        const timezones = {
            'Bangladesh': moment.tz("Asia/Dhaka").format("h:mm:ss A"),
            'India': moment.tz("Asia/Kolkata").format("h:mm:ss A"),
            'Nepal': moment.tz("Asia/Kathmandu").format("h:mm:ss A"),
            'Pakistan': moment.tz("Asia/Karachi").format("h:mm:ss A"),
            'Myanmar': moment.tz("Asia/Yangon").format("h:mm:ss A"),
            'Europe': moment.tz("Europe/Rome").format("h:mm:ss A"),
            'Qatar': moment.tz("Asia/Qatar").format("h:mm:ss A"),
            'Germany': moment.tz("Europe/Berlin").format("h:mm:ss A"),
            'Bhutan': moment.tz("Asia/Thimphu").format("h:mm:ss A"),
            'Brazil': moment.tz("America/Araguaina").format("h:mm:ss A"),
            'Australia': moment.tz("Australia/Sydney").format("h:mm:ss A"),
            'Barbados': moment.tz("America/Barbados").format("h:mm:ss A"),
            'Afghanistan': moment.tz("Asia/Kabul").format("h:mm:ss A"),
            'Argentina': moment.tz("America/Argentina/Buenos_Aires").format("h:mm:ss A"),
            'France': moment.tz("Europe/Paris").format("h:mm:ss A"),
            'Hong Kong': moment.tz("Asia/Hong_Kong").format("h:mm:ss A"),
            'Indonesia': moment.tz("Asia/Jakarta").format("h:mm:ss A"),
        };

        // Création du corps du message
        let body = `\n\n*______________________________*\nHeure actuelle: ${time}\nDate: ${formattedDate}\n*______________________________*\n\n`;
        
        for (const [country, time] of Object.entries(timezones)) {
            body += `*${country} Time:* ${time}\n`;
            body += `*${country} Date:* ${moment.tz(country).format("dddd, DD MMMM")}\n*______________________________*\n\n`;
        }

        // Obtenir des informations sur l'uptime
        const uptime = process.uptime();
        const seconds = Math.floor(uptime % 60);
        const minutes = Math.floor((uptime / 60) % 60);
        const hours = Math.floor((uptime / (60 * 60)) % 24);
        const days = Math.floor(uptime / (60 * 60 * 24));
        const uptimeString = `${days} jours ${hours} heures ${minutes} minutes ${seconds} secondes`;
        const totalMemory = `Mémoire totale: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} Go`;

        body += `*______________________________*\n[Uptime]\nEn marche: ${uptimeString}\n${totalMemory}\n`;

        // Envoyer le message
        await sendMessage(senderId, { body, attachment: frog });
    } catch (error) {
        console.error('Erreur lors de la récupération des informations:', error);
        if (error.response) {
            console.error('Détails de la réponse:', error.response.data);
        }
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des informations.");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "timezones",  // Le nom de la commande
    description: "Envoyer l'heure actuelle et les informations de fuseau horaire pour plusieurs pays.",  // Description de la commande
    usage: "Envoyez 'timezones' pour recevoir l'heure actuelle et des informations de fuseau horaire."  // Comment utiliser la commande
};
