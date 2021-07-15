const translator = require('@vitalets/google-translate-api');

/**
 * 
 * @param {String} string 
 * @param {String} language 
 */

module.exports = async function translate(string, language) {
    if (!string) return console.log("[TRANSLATE]: No Strings Provided!")
    if (!language) return console.log("[TRANSLATE]: No Language Provided!")

    let translation = await translator(string, { to: language }).catch(e => console.log(e));
    return translation.text;
}