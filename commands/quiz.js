const axios = require('axios');
const sendMessage = require('../handles/sendMessage'); // Importer la fonction sendMessage

// Objet pour stocker les questions et les réponses pour chaque utilisateur
const userQuizzes = {};

module.exports = async (senderId, prompt) => {
    try {
        // Vérifier si l'utilisateur a déjà un quiz en cours
        if (userQuizzes[senderId]) {
            const userAnswer = prompt.trim(); // Réponse de l'utilisateur
            const correctAnswer = userQuizzes[senderId].correctAnswer;
            const shuffledAnswers = userQuizzes[senderId].shuffledAnswers;

            // Vérifier si l'utilisateur a entré un numéro valide
            const userAnswerIndex = parseInt(userAnswer, 10) - 1; // Convertir la réponse en index (1-based -> 0-based)

            if (!isNaN(userAnswerIndex) && shuffledAnswers[userAnswerIndex] === correctAnswer) {
                await sendMessage(senderId, "🎉 Réponse correcte !");
            } else {
                await sendMessage(senderId, `❌ Réponse incorrecte. La bonne réponse est : ${correctAnswer}.`);
            }

            // Relancer automatiquement une nouvelle question
            return await askNewQuestion(senderId);
        }

        // Appeler l'API Open Trivia Database pour obtenir une question
        return await askNewQuestion(senderId);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Open Trivia Database:', error);
        
        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

async function askNewQuestion(senderId) {
    try {
        // Appeler l'API Open Trivia Database pour obtenir une question
        const apiUrl = 'https://opentdb.com/api.php?amount=1&type=multiple';
        const response = await axios.get(apiUrl);

        // Vérifier si l'API a renvoyé une question avec succès
        if (response.data.response_code === 0) {
            // Récupérer la question et les réponses
            const quizData = response.data.results[0];
            const question = quizData.question;
            const correctAnswer = quizData.correct_answer;
            const incorrectAnswers = quizData.incorrect_answers;

            // Créer un tableau des réponses possibles
            const allAnswers = [correctAnswer, ...incorrectAnswers];
            const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5); // Mélanger les réponses

            // Traduire la question et les réponses avec MyMemory, avec découpage si nécessaire
            const translatedQuestion = await translateTextWithLimit(question, 'en', 'fr');
            const translatedAnswers = await Promise.all(shuffledAnswers.map(answer => translateTextWithLimit(answer, 'en', 'fr')));
            const translatedCorrectAnswer = await translateTextWithLimit(correctAnswer, 'en', 'fr');

            // Stocker les données du quiz pour cet utilisateur
            userQuizzes[senderId] = {
                question: translatedQuestion,
                correctAnswer: translatedCorrectAnswer,
                shuffledAnswers: translatedAnswers,
            };

            // Formater la réponse à envoyer à l'utilisateur
            const formattedAnswers = translatedAnswers.map((answer, index) => `${index + 1}. ${answer}`).join('\n');

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Envoyer la question et les réponses mélangées à l'utilisateur
            await sendMessage(senderId, `Voici votre question de quiz :\n${translatedQuestion}\n\nChoisissez une réponse :\n${formattedAnswers}`);
        } else {
            await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération du quiz.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Open Trivia Database:', error);
        
        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
}

// Fonction pour découper le texte en morceaux de 500 caractères maximum
function splitTextIntoChunks(text, maxLength = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
        chunks.push(text.slice(i, i + maxLength));
    }
    return chunks;
}

// Fonction pour traduire du texte avec MyMemory, en découpant si nécessaire
async function translateTextWithLimit(text, fromLang, toLang) {
    const chunks = splitTextIntoChunks(text, 500); // Découper le texte en morceaux de 500 caractères maximum
    const translatedChunks = await Promise.all(chunks.map(async (chunk) => {
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${fromLang}|${toLang}`;
        const response = await axios.get(translateUrl);
        return response.data.responseData.translatedText;
    }));
    return translatedChunks.join(' '); // Recombiner les morceaux traduits
}

// Ajouter les informations de la commande
module.exports.info = {
    name: "quiz",  // Le nom de la commande
    description: "Poser une question de quiz aléatoire et vérifier la réponse.",  // Description de la commande
    usage: "Envoyez 'quiz' pour commencer un quiz. Répondez en tapant le numéro de la réponse."  // Comment utiliser la commande
};
