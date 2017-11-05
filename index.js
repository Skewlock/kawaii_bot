/* this bot have been created by Skewlock
the 21/08/2017
invite https://discordapp.com/oauth2/authorize?&client_id=349599792399384593&scope=bot&permissions=-1
*/

//déclaration de tout ce que l'on a besoin pour le bot
'use strict';
const Discord = require("discord.js");
const config = require("./config/config.json");
const cmds = require("./commands.js");
const music = require('./music.js');
const tool = require("./tool.js");
const prompt = require("prompt");
const colors = require('colors');
prompt.message = "";
prompt.delimiter = '';
const PersistentCollection = require('djs-collection-persistent');
const client = new Discord.Client();
const guildSettings = new PersistentCollection
(
  {
    name: 'guildSettings'
  }
);

const defaultSettings =
{
  prefix: "/",
  greetings: "Bienvenue {user} sur {server} !",
  farewell: "{user} a quitté {server} :frowning:",
  censors: []
}
var reaction = ["message.author", "messageReactionAdd.messageReaction"]
var arr = ["./huggif/hug1.gif", './huggif/hug2.gif', './huggif/hug3.gif', './huggif/hug4.gif', './huggif/hug5.gif', './huggif/hug6.gif', './huggif/hug7.gif', './huggif/hug8.gif', './huggif/hug9.gif', './huggif/hug10.gif']
var mention = "<@349599792399384593>"
var prefix = "/"
//arrivée dans une nouvelle guilde
client.on("guildCreate", guild =>
{
  guildSettings.set(guild.id, defaultSettings);
});
//lancement du bot
client.on("ready", () =>
  {
  console.log("");
  console.log("${bot.user.username} démarre ...");
  console.log("[!] Le bot est prêt !");
  console.log("[!] préfix actuel " + prefix);
  console.log("[!] mention " + mention);
  console.log("Je suis sur ${bot.guild.size} guildes !");
  console.log("");
  client.user.setPresence({ game: { name: 'se brosser les poils', type: 0 } });//indique le jeu du bot
  });
client.on('message',msg => {
  if (msg.author.bot || msg.channel.type != 'text')
  {
    return;
  }
  if(msgc.startsWith(config.prefix)||(config.mention))
  {
    return;
  }
  let cmd = message.content.split(/\s+/)[0].slice(config.prefix.length).toLowerCase();
  getCmdFunction(cmd)(msg);
});

bot.on('error', (e) => console.log(e));
bot.on('warn', (e) => console.log(e));
bot.login(config.token);
function getCmdFunction(cmd){
  const COMMANDS = {
    'help': cmd.help,
    'music': music.processCommands,
  }
  return COMMANDS[cmd] ? COMMANDS[CMD] : () => {};
}
