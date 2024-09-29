const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

module.exports = async (senderId, userText, event, api) => {
    const { threadID, messageID, body } = event;  // Extraire les informations de l'événement
    const args = userText.trim().split(' ').slice(1); // Supposons que userText commence par 'clear'
    const num = args[0];

    if (!num || isNaN(parseInt(num))) {
        return sendMessage(senderId, 'Votre choix doit être un nombre.', threadID);
    }

    const botID = global.data && global.data.botID ? global.data.botID : api.getCurrentUserID();
    const botMessages = await api.getThreadHistory(threadID, parseInt(num));
    const botSentMessages = botMessages.filter(message => message.senderID === botID);
    const numtn = `${botSentMessages.length}`;
    const todam = body.split("").map(c => mathSansBold[c] || c).join("");
    const todam2 = numtn.split("").map(c => mathSansBold[c] || c).join("");
    const todam3 = num.split("").map(c => mathSansBold[c] || c).join("");

    if (botSentMessages.length === 0) {
        return sendMessage(senderId, `Aucun message du bot trouvé dans l'intervalle de recherche de 「${todam}」 à ${todam3}.`, threadID);
    }

    sendMessage(senderId, `Trouvé ${todam2} message(s) du bot dans l'intervalle de messages de\n「 ${todam} à ${todam3} 」.\n Suppression dans 30 secondes...`, threadID);

    const unsendBotMessages = async () => {
        for (const message of botSentMessages) {
            await api.unsendMessage(message.messageID);
        }
    };

    setTimeout(async () => {
        await unsendBotMessages();
    }, 30000); // 30 secondes
};

// Table de caractères en gras sans sérif (MathSansBold)
const mathSansBold = {
    A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜",
    J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠", N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥",
    S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭", 
    a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞", f: "𝐟", g: "𝐠", h: "𝐡", i: "𝐢",
    j: "𝐣", k: "𝐤", l: "𝐥", m: "𝐦", n: "𝐧", o: "𝐨", p: "𝐩", q: "𝐪", r: "𝐫",
    s: "𝐬", t: "𝐭", u: "𝐮", v: "𝐯", w: "𝐰", x: "𝐱", y: "𝐲", z: "𝐳", 
    0: "𝟎", 1: "𝟏", 2: "𝟐", 3: "𝟑", 4: "𝟒", 5: "𝟓", 6: "𝟔", 7: "𝟕", 8: "𝟖", 9: "𝟗"
};

// Ajouter les informations de la commande
module.exports.info = {
    name: "clear",  // Le nom de la commande
    description: "Effacer les messages du bot dans un intervalle de messages.",  // Description de la commande
    usage: "Envoyez 'clear <nombre>' pour supprimer les messages du bot dans l'intervalle donné."  // Comment utiliser la commande
};
