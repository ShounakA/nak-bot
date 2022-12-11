import NSpell from 'nspell';
import dictionaryEn from 'dictionary-en'
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import { anaylzeSpelling, fuckYouToo, randomInsult, randomPun } from './actions';

dotenv.config();

let checker:any = null;
const ondictionary = (err: any, dict: any) => {
   if (err) throw err;
   checker = NSpell(dict);
}
dictionaryEn(ondictionary);

const client = new Client({ intents: [ GatewayIntentBits.Guilds, 
                                       GatewayIntentBits.GuildMessages, 
                                       GatewayIntentBits.MessageContent] });

client.on('ready', () => {
	console.log(`Logged in as ${client?.user?.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});

client.on('messageCreate', async (message) => {
   if (message.author.bot) return;
   let mess = message.content;
   await anaylzeSpelling(mess, 0.05, 
      async (wordInMessage) => {
         if (!checker.correct(wordInMessage)) {
            let sugg: string[] = checker.suggest(wordInMessage);
            const emote = client.emojis.cache.find(emoji => emoji.name === '5Head');
            let reply = `${emote} I think you mean? ${sugg.slice(0,3).join(', ')}`;
            await message.reply(reply);
         }
   });
   await fuckYouToo(mess, 0.3, 
      async (replyMessage) => {
         const userToReply = message.author;
         await message.reply(`${userToReply} - ${replyMessage} 😠`);
   });
   await randomInsult(0.03, 
      async (replyInsult) => {
         const userToReply = message.author;
         await message.reply(`${userToReply} - ${replyInsult}`);
   });
   await randomPun(0.03, 
      async (replyPun) => {
         const userToReply = message.author;
         await message.reply(`${userToReply} - ${replyPun}`);
   });
});


client.login(process.env.DISCORD_BOT_TOKEN);