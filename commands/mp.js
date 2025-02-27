const axios = require("axios");
const express = require("express");
const app = express();
const PORT = 3000;

let userSessions = {}; // Stocke les pages en cours pour chaque utilisateur

// Fonction pour récupérer les données de l'API
async function fetchProverbs(query, page) {
    try {
        const url = `https://api-test-one-brown.vercel.app/fitadiavana?ohabolana=${query}&page=${page}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        return null;
    }
}

// Fonction pour afficher les résultats
function formatProverbs(results) {
    return results
        .map((proverb, index) => `${index + 1}. ${proverb}`)
        .join("\n");
}

// Route pour gérer les messages des utilisateurs
app.get("/message", async (req, res) => {
    const userId = req.query.userId || "defaultUser";
    const message = req.query.text;

    if (!userSessions[userId]) {
        userSessions[userId] = { query: "omby", page: 1 }; // Défaut : page 1
    }

    let { query, page } = userSessions[userId];

    // Vérifie si l'utilisateur tape un numéro de page
    const requestedPage = parseInt(message);
    if (!isNaN(requestedPage)) {
        page = requestedPage; // Met à jour la page demandée
        userSessions[userId].page = page;
    }

    // Récupère les proverbes de l'API
    const data = await fetchProverbs(query, page);
    if (!data || !data.results) {
        return res.send("Erreur : Impossible de récupérer les données.");
    }

    // Formate et envoie la réponse
    let responseText = formatProverbs(data.results);
    if (data.nextPage) {
        responseText += `\n\n🔹 Tape un numéro (ex: ${page + 1}) pour voir la page suivante.`;
    }

    res.send(responseText);
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});
