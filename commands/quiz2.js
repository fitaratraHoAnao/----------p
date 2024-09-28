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

            // Convertir la réponse de l'utilisateur en index (1-based -> 0-based)
            const userAnswerIndex = parseInt(userAnswer, 10) - 1;

            // Vérifier que la réponse donnée est correcte
            if (!isNaN(userAnswerIndex) && 
                shuffledAnswers[userAnswerIndex].toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                await sendMessage(senderId, "🎉 Réponse correcte !");
            } else {
                await sendMessage(senderId, `❌ Réponse incorrecte. La bonne réponse est : ${correctAnswer}.`);
            }

            // Relancer automatiquement une nouvelle question
            return await askNewQuestion(senderId);
        }

        // Si l'utilisateur n'a pas de quiz en cours, démarrer un nouveau quiz
        return await askNewQuestion(senderId);
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Open Trivia Database:', error);
        
        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
};

// Fonction pour appeler l'API MyMemory pour traduire un texte en français
async function translateToFrench(text) {
    const myMemoryApiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`;
    try {
        const response = await axios.get(myMemoryApiUrl);
        const translatedText = response.data.responseData.translatedText;
        return translatedText;
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API MyMemory:", error);
        return text; // Retourner le texte original en cas d'erreur
    }
}

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

            // Stocker les données du quiz pour cet utilisateur
            userQuizzes[senderId] = {
                question: question,
                correctAnswer: correctAnswer,
                shuffledAnswers: shuffledAnswers,
            };

            // Traduire la question en français
            const translatedQuestion = await translateToFrench(question);

            // Traduire les réponses également en français
            const translatedAnswers = await Promise.all(
                shuffledAnswers.map(async (answer) => await translateToFrench(answer))
            );

            // Formater la réponse à envoyer à l'utilisateur
            const formattedAnswers = translatedAnswers.map((answer, index) => `${index + 1}. ${answer}`).join('\n');

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

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

// Ajouter les informations de la commande
module.exports.info = {
    name: "quiz2",  // Le nom de la commande
    description: "Poser une question de quiz aléatoire et vérifier la réponse.",  // Description de la commande
    usage: "Envoyez 'quiz2' pour commencer un quiz. Répondez en tapant la réponse exacte à la question."  // Comment utiliser la commande
};
