
const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Stocker les emails générés pour chaque utilisateur
const userSessions = {};

// Fonction pour découper un message long en plusieurs parties
const splitMessageInChunks = (message, maxLength = 1900) => {
    // Si le message est court, le retourner tel quel
    if (message.length <= maxLength) {
        return [message];
    }
    
    const chunks = [];
    // Découper le message en lignes
    const lines = message.split('\n');
    let currentChunk = '';
    
    for (const line of lines) {
        // Si ajouter cette ligne dépasserait la longueur maximale
        if (currentChunk.length + line.length + 1 > maxLength) {
            // Si la ligne seule est déjà trop longue
            if (line.length > maxLength) {
                // Ajouter le morceau actuel s'il n'est pas vide
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                
                // Découper la ligne en morceaux
                let remainingLine = line;
                while (remainingLine.length > 0) {
                    chunks.push(remainingLine.substring(0, maxLength));
                    remainingLine = remainingLine.substring(maxLength);
                }
            } else {
                // Ajouter le morceau actuel et commencer un nouveau avec cette ligne
                chunks.push(currentChunk);
                currentChunk = line;
            }
        } else {
            // Ajouter la ligne au morceau actuel
            if (currentChunk.length > 0) {
                currentChunk += '\n' + line;
            } else {
                currentChunk = line;
            }
        }
    }
    
    // Ajouter le dernier morceau s'il n'est pas vide
    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }
    
    return chunks;
};

module.exports = async (senderId, prompt) => { 
    try {
        if (prompt.toLowerCase() === "create") {
            // Message d'attente stylé
            await sendMessage(senderId, "📩✨ Génération de ton email magique en cours... Patiente quelques instants ! 🔥📨");

            // Générer une adresse email temporaire
            const createEmailUrl = "https://api-test-liart-alpha.vercel.app/create";
            const createResponse = await axios.get(createEmailUrl);
            
            const email = createResponse.data.address;  // Accès au champ address dans la réponse
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
            const inboxUrl = `https://api-test-liart-alpha.vercel.app/inbox?message=${prompt}`;
            const inboxResponse = await axios.get(inboxUrl);
            const emails = inboxResponse.data.emails;

            if (emails.length === 0) {
                return await sendMessage(senderId, "🚫 Aucun message reçu pour le moment. Reviens plus tard !");
            }

            // Envoyer les messages un par un
            for (const email of emails) {
                // Envoyer l'en-tête du message
                let header = `📨 **Nouveau message reçu !**\n`;
                header += `👤 **Expéditeur :** ${email.from}\n`;
                header += `📌 **Objet :** ${email.subject}\n`;
                header += `📄 **Message :** \n`;
                
                await sendMessage(senderId, header);
                
                // Découper le corps du message en morceaux de 1900 caractères max
                const bodyChunks = splitMessageInChunks(email.body);
                
                // Envoyer chaque morceau du corps du message
                for (let i = 0; i < bodyChunks.length; i++) {
                    const isFirstChunk = i === 0;
                    const isLastChunk = i === bodyChunks.length - 1;
                    
                    let messageText = bodyChunks[i];
                    
                    // Ajouter des délimiteurs pour indiquer où commence et finit chaque partie
                    if (!isFirstChunk) {
                        messageText = "⬇️ Suite du message ⬇️\n\n" + messageText;
                    }
                    
                    if (!isLastChunk) {
                        messageText += "\n\n⬇️ Message à suivre ⬇️";
                    }
                    
                    await sendMessage(senderId, messageText);
                    
                    // Petite pause entre chaque envoi pour éviter les limitations
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
                // Pause avant le prochain email
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
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
