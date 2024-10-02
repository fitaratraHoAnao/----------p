const moment = require('moment-timezone');
const os = require('os');
const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

moment.tz.setDefault('Asia/Dhaka'); // Définir le fuseau horaire par défaut

module.exports = async (senderId) => {
    try {
        // Envoyer un message de confirmation que la requête est en cours
        await sendMessage(senderId, "Je recherche des informations sur les fuseaux horaires...");

        // Chargement de l'image de grenouille
        const frog = await global.utils.getStreamFromURL("https://i.ibb.co/kmFdGF6/image.jpg");
        
        // Récupérer l'heure et la date de différents fuseaux horaires
        const now = moment();
        const time = now.format('hh.mm.ss A');
        const formattedDate = now.format('Y');

        // Création des objets pour les différents fuseaux horaires
        const timezones = {
            India: moment.tz("Asia/Kolkata"),
            Nepal: moment.tz("Asia/Kathmandu"),
            Pakistan: moment.tz("Asia/Karachi"),
            Myanmar: moment.tz("Asia/Yangon"),
            Europe: moment.tz("Europe/Rome"),
            Qatar: moment.tz("Asia/Qatar"),
            Germany: moment.tz("Europe/Berlin"),
            Bhutan: moment.tz("Asia/Thimphu"),
            Brazil: moment.tz("America/Araguaina"),
            Australia: moment.tz("Antarctica/Macquarie"),
            Barbados: moment.tz("America/Barbados"),
            Afghanistan: moment.tz("Asia/Kabul"),
            Argentina: moment.tz("America/Argentina/Buenos_Aires"),
            France: moment.tz("Europe/Paris"),
            Hong_Kong: moment.tz("Asia/Hong_Kong"),
            Indonesia: moment.tz("Asia/Jakarta"),
        };

        // Construire le corps du message avec les heures et dates formatées
        const Body = Object.entries(timezones).map(([country, timezone]) => {
            return `*______________________________*\n${country} Time: ${timezone.format('h:mm:ss A')}\n${country} Date: ${timezone.format('dddd, DD MMMM')}\n`;
        }).join('\n') + 
        `*______________________________*\n\n*______________________________*\nBangladesh Time: ${time}\nYear: ${formattedDate}\n*______________________________*\n\n` +
        `ㅤㅤㅤㅤㅤㅤㅤ[Uptime]ㅤㅤㅤㅤㅤㅤㅤ\n\n` +
        `Up: ${formatUptime(process.uptime())}\nRam: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`;

        // Envoyer le message avec le corps et l'image de grenouille
        await sendMessage(senderId, { body: Body, attachment: frog });

    } catch (error) {
        console.error('Erreur lors de la récupération des informations:', error);
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération des informations.");
    }
};

// Fonction pour formater l'uptime
const formatUptime = (uptime) => {
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));
    return `${days} jours ${hours} heures ${minutes} minutes ${seconds} secondes`;
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "timezones",  // Le nom de la commande
    description: "Envoyer les heures et dates de différents fuseaux horaires",  // Description de la commande
    usage: "Envoyez 'timezones' pour recevoir les informations sur les fuseaux horaires."  // Comment utiliser la commande
};
