const axios = require('axios');
const sendMessage = require('../handles/sendMessage');

async function createPost(api, formData) {
  try {
    const response = await axios.post('https://www.facebook.com/api/graphql/', {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "ComposerStoryCreateMutation",
      fb_api_caller_class: "RelayModern",
      doc_id: "7711610262190099",
      variables: JSON.stringify(formData)
    });

    const responseData = response.data;
    if (responseData && responseData.data && responseData.data.story_create) {
      const postID = responseData.data.story_create.story.legacy_story_hideable_id;
      const postURL = responseData.data.story_create.story.url;
      return { postID, postURL };
    } else {
      throw new Error('Réponse invalide de l\'API');
    }
  } catch (error) {
    console.error("Erreur lors de la création du post :", error.message);
    throw error;
  }
}

function getGUID() {
  var sectionLength = Date.now();
  var id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.floor((sectionLength + Math.random() * 16) % 16);
    sectionLength = Math.floor(sectionLength / 16);
    var _guid = (c === "x" ? r : (r & 7) | 8).toString(16);
    return _guid;
  });
  return id;
}

module.exports = async (senderId, message, api) => {
  try {
    const args = message.split(' ');
    const audienceOptions = {
      "1": "EVERYONE",
      "2": "FRIENDS",
      "3": "SELF"
    };

    const audienceChoice = args[0];
    const content = args.slice(1).join(" ");

    if (!audienceOptions[audienceChoice]) {
      return sendMessage(senderId, "Choix de visibilité invalide. Veuillez choisir 1 (Public), 2 (Amis) ou 3 (Moi uniquement).");
    }

    const uuid = getGUID();
    const formData = {
      "input": {
        "composer_entry_point": "inline_composer",
        "composer_source_surface": "timeline",
        "idempotence_token": uuid + "_FEED",
        "source": "WWW",
        "attachments": [],
        "audience": {
          "privacy": {
            "allow": [],
            "base_state": audienceOptions[audienceChoice],
            "deny": [],
            "tag_expansion_state": "UNSPECIFIED"
          }
        },
        "message": {
          "ranges": [],
          "text": content
        },
        "actor_id": api.getCurrentUserID(),
        "client_mutation_id": Math.floor(Math.random() * 17)
      }
    };

    const postResult = await createPost(api, formData);
    sendMessage(senderId, `✅ Post créé avec succès !\n👉 Post ID: ${postResult.postID}\n🔗 Lien : ${postResult.postURL}`);
    
  } catch (error) {
    console.error('Erreur lors de la publication :', error.message);
    sendMessage(senderId, "❌ Impossible de créer le post. Veuillez réessayer plus tard.");
  }
};

// Informations de la commande
module.exports.info = {
  name: "post",
  description: "Publier un message sur votre profil Facebook.",
  usage: "Envoyez 'post 1 Bonjour tout le monde !' pour publier un message public (1 = Public, 2 = Amis, 3 = Moi uniquement)."
};
