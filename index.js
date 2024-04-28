import { config } from 'dotenv'
import { Client, GatewayIntentBits } from 'discord.js'
import { google } from 'googleapis'
import { schedule } from 'node-cron'

config();


const DiscordClient = new Client({
  intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds]
});

const youtubeClient = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

let lastVideoId = '';

DiscordClient.login(process.env.DISCORD_TOKEN);

DiscordClient.on('ready', () => {
  console.log(`Bot online, logado como: ${DiscordClient}`);
  checkNewsVideos();
  schedule('* * 0 * * *', checkNewsVideos);
});

async function checkNewsVideos() {
  try {
    const response = await youtubeClient.search.list({
      channelId: 'UC69JW8XvnPjXZfysWQqOk4Q',
      order: 'date',
      part: 'snippet',
      type: 'video',
      maxResults: 1
    }).then(response => response);

    const latestVideo = response.data.items[0];

    if (latestVideo.id.video !== lastVideoId) {
      lastVideoId = latestVideo.id.videoId
      const videoUrl = `https://www.youtube.com/watch?v=${lastVideoId}`;
      const message = 'See the last released video on the channel';
      const channel = DiscordClient.channels.cache.get(process.env.CHANNEL_KEY);

      channel.send(message + '\n ' + videoUrl);


    }
  } catch (err) {
    console.log('algo deu errado...');
    console.log(err);
  }
};