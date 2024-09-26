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

            // Vérifier la réponse de l'utilisateur
            if (userAnswer === correctAnswer) {
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
        // Appeler l'API Open Trivia Database pour obtenir une question en français
        const apiUrl = 'https://opentdb.com/api.php?amount=1&type=multiple&language=fr';
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

            // Formater la réponse à envoyer à l'utilisateur
            const formattedAnswers = shuffledAnswers.map((answer, index) => `${index + 1}. ${answer}`).join('\n');

            // Attendre 2 secondes avant d'envoyer la réponse
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Envoyer la question et les réponses mélangées à l'utilisateur
            await sendMessage(senderId, `Voici votre question de quiz :\n${question}\n\nChoisissez une réponse :\n${formattedAnswers}`);
        } else {
            await sendMessage(senderId, "Désolé, une erreur s'est produite lors de la récupération du quiz.");
        }
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Open Trivia Database:', error);
        
        // Envoyer un message d'erreur à l'utilisateur en cas de problème
        await sendMessage(senderId, "Désolé, une erreur s'est produite lors du traitement de votre message.");
    }
}
