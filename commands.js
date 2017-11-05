'use strict';
const config = require("./config.json");
const commandHelp = require("./help.js");
const tool = require("./tool.js");
const rp = require('request-promise');
const stripIndent = require('strip-indent');

module.export = {
  'help': help,
  'ban': ban
}

function help(msg) {
  let args = message.content.split(/\s+/).slice(1);

  let helpStr;
  if(args.length == 1){
      if(args[0].charAt(0) == config.prefix)
        args[0] = args[0].slice(1);
      helpStr = commandHelp[args[0]];
  }
  if (helpStr)
  message.channel.send(helpStr, {
    'code': 'css'
  });
  else
      msg.channel.send(stripIndent(
        `
        [help menu]
        !help [command]

        #utilité :
            !music
        [] = optionnel, <> = require, | = ou
        `), {
          'code': 'css'
        });
}

function ban(msg) {
  if (!msg.member.haspermission('BAN_MEMBERS')){
    return msg.channel.send("Vous n'avez pas la permission de ban");
  }
  let memberToBan = msg.mentions.member.first();
  if(memberToBan && memberToBan.bannable && (msg.member.highestRole.calculatedPosition > memberToBan.highestRole.calculatedPosition || msg.guild.ownerID == msg.author.id)){
    let reason = tool.parseOptionArgs('raison', msg.content);
    let days = parseInt(tool.parseOption.args('days', msg.content));

    let banOption = {
      days: days ? days : 0,
      raison: raison ? raison: 'Aucune raison !'
    };
    memberToBan.ban(banOption);
  }
}
