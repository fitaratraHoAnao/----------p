const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stocker les emails générés pour chaque utilisateur
const userSessions = {};

module.exports = async (senderId, prompt) => { 
    try {
        if (prompt.toLowerCase() === "create") {
            // Message d'attente stylé
            await sendMessage(senderId, "📩✨ Génération de ton email magique en cours... Patiente quelques instants ! 🔥📨");

            // Générer une adresse email temporaire
            const createEmailUrl = "https://api-test-one-brown.vercel.app/create";
            const createResponse = await axios.get(createEmailUrl);
            
            const email = createResponse.data.email;
            const token = createResponse.data.token;

            // Stocker l'email pour cet utilisateur
            userSessions[senderId] = email;

            // Répondre avec l'email généré et le token
            const reply = `✅ **Email temporaire créé avec succès !**\n\n📩 **Email :** ${email}\n🔑 **Token :** ${token}\n\n📨 *Envoie cet email ici pour voir les messages reçus.*`;
            await sendMessage(senderId, reply);
        } 
        else if (prompt.includes("@")) {
            // Vérifier si l'utilisateur a bien généré un email auparavant
            if (!userSessions[senderId] || userSessions[senderId] !== prompt) {
                return await sendMessage(senderId, "🚨 Cet email ne correspond pas à celui que tu as généré. Fais 'create' pour obtenir un nouvel email.");
            }

            // Message d'attente avant de récupérer les messages
            await sendMessage(senderId, "📬📨 Récupération des messages en cours... Patiente un instant ! 🕵️‍♂️✨");

            // Récupérer la boîte de réception
            const inboxUrl = `https://api-test-one-brown.vercel.app/inbox?mail=${prompt}`;
            const inboxResponse = await axios.get(inboxUrl);
            const emails = inboxResponse.data.emails;

            // Construire la réponse
            let reply = `📥 **Boîte de réception pour** ${prompt} :\n\n`;

            if (emails.length > 0) {
                const lastEmail = emails[0];
                reply += `📨 **Dernier message reçu :**\n`;
                reply += `👤 **Expéditeur :** ${lastEmail.from}\n`;
                reply += `📌 **Objet :** ${lastEmail.subject}\n`;
                reply += `📄 **Message :**\n${lastEmail.body.substring(0, 300)}...\n\n📎 *Voir l'email complet dans ta boîte de réception.*`;
            } else {
                reply += "🚫 Aucun message reçu pour le moment. Reviens plus tard !";
            }

            await sendMessage(senderId, reply);
        } 
        else {
            await sendMessage(senderId, "🤔 Je ne comprends pas ta demande. Tape 'create' pour générer un email temporaire.");
        }
    } catch (error) {
        console.error("Erreur lors du traitement :", error);
        await sendMessage(senderId, "🚨 Oups ! Une erreur est survenue. Réessaie plus tard ! 😢📩");
    }
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "tempmail",  
    description: "Génère un email temporaire et permet de voir les messages reçus.",  
    usage: "Envoyez 'create' pour générer un email temporaire, puis envoyez l'email pour voir les messages reçus."  
};
