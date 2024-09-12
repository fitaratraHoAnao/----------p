const axios = require('axios');

module.exports = {
  name: 'par',
  description: 'Fetch a response from Bruno based on a given prompt',
  author: 'Bruno',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    if (args.length === 0) {
      return sendMessage(senderId, { text: 'Please provide a prompt for Bruno.' }, pageAccessToken);
    }

    const prompt = encodeURIComponent(args.join(" "));
    const apiUrl = `https://discussion-continue-gem29.vercel.app/api?ask=${prompt}`;

    // Envoyer un message de patience
    sendMessage(senderId, { text: "Bruno vous répondra dans quelques instants, mais veuillez patienter..." }, pageAccessToken);

    try {
      // Faire la requête à l'API
      const response = await axios.get(apiUrl);

      if (response.data && response.data.response) {
        // Ajouter le titre à la réponse
        const message = `🇲🇬🍟Bruno IA ESPA🍟🇲🇬\n\n${response.data.response}`;

        // Envoyer la réponse avec le titre
        sendMessage(senderId, { text: message }, pageAccessToken);
        
        // Stocker le contexte pour conversation continue
        global.ConversationContext = global.ConversationContext || {};
        global.ConversationContext[senderId] = {
          previousQuestion: args.join(" "),
          response: response.data.response
        };
      } else {
        sendMessage(senderId, { text: 'Unable to get a response from Bruno.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error making API request:', error.message, error.response?.data);
      // Supprimer ce message si vous ne souhaitez pas qu'il s'affiche
    }
  }
};
