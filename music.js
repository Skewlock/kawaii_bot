'use strict';
const config = require('./config.json');
const tool = require('./tool.js');
const ytdl = require('ytdl-core');

const song = require('./obj/Song.js');
const MusicPlayer = require('./obj/MusicPlayer.js');
const youtubeDL = require('youtube-dl');
const rp = require('request-promise');

module.exports.processCommands = processCommands;

let guilds = {};

function processCommands(msg) {
    if(!msg.guild.available) return;
    if(!guilds[msg.guild.id])
    guilds[msg.guild.id] = new MusicPlayer(msg.guild);
    let guild = guilds[msg.guild.id];
    let musicCmd = msg.content.split(/\s+/)[1];
    if(musicCmd)
        musicCmd.toLowerCase();
    switch(musicCmd){
      case 'play':
        return processInput(msg, guild);
      case 'skip':
        return guild.skipSong(msg);
      case 'pause':
        return guild.pauseSong();
      case 'resume':
        return guild.resumeSong();
      case 'queue':
        return guild.printQueue(msg);
      case 'np':
        return guild.nowPlaying(msg);
      case 'vol':
        return guild.setVolume(msg);
      case 'purge':
        return guild.purgeQueue(msg);
      case 'join':
        return guild.joinVc(msg);
      case 'leave':
        return guild.leaveVc(msg);
      default:
        msg.channel.send(`Merci de vous réfferer à ${tool.warp(config.prefix + 'help music')}`);
    }
}

function processInput(msg, guild) {
    let url = msg.content.split(/\s+/).slice(2).join(' ');
    if(url) {
        if(!url.startsWith('http')) {
            processSearch(msg, guild, url);
        } else if (url.search('youtube.com')) {
          let playlist = url.match(/list=(\S+?)(&|\s|$|#)/);
          if(playlist) {
            processYoutube.playlist(msg, guild, playlist[1]);
          } else if (url.search(/v=(\S+?)(&|\s|$|#)/)) {
            processYoutube.song(msg, guild, url);
          } else {
            msg.channel.send('Le lien est invalide désolé');
          }
        } else if (url.search('soundcloud.com')) {
          msg.channel.send('désolé je ne peux pas encore lire les musiques de soundcloud');
        } else {
          msg.channel.send('Désolé seul les lien youtubes marchent');
        }
    }
}
function processSearch(msg, guild, searchQuery) {
  searchQuery = 'ytsearch1:' + searchQuery;
  youtubeDL.getinfo(searchQuery, ['--extract-audio'], (err, song) => {
    if(err) {
      msg.channel.send("Désolé je ne peux pas trouver le son.");
      return console.log(err);
    }
    guild.queueSong(new Song(song.title, song.url, 'search'));
    msg.channel.send(`Ajout a la queue ${tool.wrap(song.title.trim())} demandé par ${tool.wrap(msg.author.username + '#') + msg.author.discriminator}`);
  if(guild.status != 'playing')
    guild.playSong(msg, guild);
});
}

const processYoutube ={

  song(msg, guild, url){
    ytdl.getInfo(url, (err, song) => {
      if(err){
        console.log(err);
        msg.channel.send(`Désolé je ne peux pas ajouter la musique`);
        return;
      }
      guild.queueSong(new Song(Song.title, url, 'youtube'));
      msg.channel.send(`Ajout a la queue ${tool.wrap(song.title.trim())} demandé par ${tool.wrap(msg.author.username + '#') + msg.author.discriminator}`);
      if(guild.status != 'playing'){
        guild.playSong(msg);
      }
    });
  },
  playlist(msg, guild, playlistID){
    const youtubeApiUrl = 'https://www.googleapis.com/youtube/v3/';

    Promise.all([getPlaylistName(), getPlaylistSong([], null)])
    .then(results => addToQueue(results[0], results[1]))
    .catch(err => {
      console.log(err);
      msg.channel.send(`Désolé, je ne peux pas ajouter la playlist a la queue`);
    });
    async function getPlaylistName() {
      let options = {
        url : `${youtubeApiUrl}playlist?id=${playlistId}&part=snippet&key=${config.youtube_api_key}`
      }
      let body = await rp(options);
      let playlistTitle = JSON.parse(body).items[0].snippet.title;
      return playlistTitle
    }
    async function getPlaylistSongs(playlistItems, pageToken) {
      pageToken = pageToken ? `&pageToken=${pageToken}` : '';
      let options = {
        url: `${youtubeApiUrl}playlistItems?playlistID=${playlistID}${pageToken}&part=snippet&fields=nextPageToken,items(snippet(title;resourceID/videoId))&maxResults=50&key=${config.youtube_api_key}`
      }
      let body = await rp(options);
      let playlist = JSON.parse(body);
      playlistItems = playlistItems.concat(playlist.items.filter(item => item.snippet.title != 'vidéo supprimée'));
    }
    if(playlist.hasOwnProperty('nextPageToken'))
      playlistItems = await getPlaylistSong(playlistItems, playlist.nextPageToken);
      return playlistItems;

  async function addToQueue(playlistTitle, playlistItems) {
    let queueLength = guild.queue.length;

    for (let i = 0; i < playlistItems.length; i++) {
      let song = new Song(playlistItems[i].snippet.title, `https://youtube.com/watch?v=${playlistItem[i].snippet.ressourceId.videoId}`, 'youtube');
      guild.queueSong(song, i + queueLength);
    }
    msg.channel.send(`Ajouté a la queue ${tool.wrap(playlistItems.length)}`);
    if(guild.playSong(msg)) {
        guild.playSong(msg);

      }
    }
  }
}

function timer(){
  for (let guildID in guilds) {
    let guild = guilds[guildId];
    if (guild.status == 'stopped' || guild.status == 'paused')
      guild.inactivityTimer -= 10;
    if (guild.inactivityTimer < 0) {
      guild.voiceConnection.disconnect();
      guild.voiceConnection = null;
      guild.musicChannel.send(`:no_entry_sign: Plus de musique !`);

      guild.changeStatus('offline');
    }
  }
}
setInterval(timer, 10000);
