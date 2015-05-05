var BASE_API_URL = 'http://api.smitegame.com/smiteapi.svc/';
var BASE_IMAGE_URL = 'http://www.hirezstudios.com/images/default-source/';

module.exports.Table = {
  'god': 'God',
  'ability': 'Ability',
  'item': 'Item',
  'godImage': 'GodImage',
  'abilityImage': 'AbilityImage'
};

module.exports.Url = {
  'api': BASE_API_URL,
  'godIcon': BASE_IMAGE_URL + 'smite-god-icons/',
  'godCard': BASE_IMAGE_URL + 'smite-god-cards/',
  'abilityIcon':  BASE_IMAGE_URL + 'smite-god-abilities/'
};
