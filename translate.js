const translatte = require("translatte");
/**
 * 
 * @param {String} string 
 * @param {String} language 
 */

module.exports = async function translate(string, language) {
    if (!string) return console.log("[TRANSLATE]: No String Provided!")
    if (!language) return console.log("[TRANSLATE]: No Language Provided!")
    let res = await translatte(string, {from: "en", to: language });
    return res.text
}