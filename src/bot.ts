import "reflect-metadata";
import dictionaryEn from "dictionary-en";
import {
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

import NSpell from "nspell";

import {
  anaylzeSpelling,
  displayMessage,
  fetchPlayerMatchHistory,
  fuckYouToo,
  incrementCounter,
  randomInsult,
  randomPun,
} from "./actions";
import { container } from "tsyringe";
import { Gateway } from "./gateway";
import { App } from "./app";
import { startup } from "./startup";
import { Ping } from "./actions/ping";
import { Robo } from "./actions/robo";
import { Counter } from "./actions/counter";

let checker: any = null;
const ondictionary = (err: any, dict: any) => {
  if (err) throw err;
  checker = NSpell(dict);
};
dictionaryEn(ondictionary);

const matchHistoryCommand = new SlashCommandBuilder()
  .setName("hist")
  .setDescription("Get Apex Legends match history of a player.")
  .addStringOption((option) =>
    option.setName("user").setDescription("origin user name.").setRequired(true)
  );

const countCommand = new SlashCommandBuilder()
  .setName("count")
  .setDescription("Increment a specific counter")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription(
        "Name of the counter to increment. Get all counter with `/counter list`"
      )
      .setRequired(true)
  );

// Startup the program by registering all your services.
startup();
const gateway = container.resolve(Gateway);
const app = container.resolve(App);
const ping = container.resolve(Ping);
const robo = container.resolve(Robo);
const counterManage = container.resolve(Counter);

const commands = [
  robo.command().toJSON(),
  counterManage.command().toJSON(),
  countCommand.toJSON(),
  matchHistoryCommand.toJSON(),
  ping.command().toJSON(),
];

// Register the bots commands, then get the event streams.
app.start(commands)
  .then((_result) => {
    const readyStream$ = gateway.readyStream$;
    const interactionStream$ = gateway.interactionStream$;
    const messageStream$ = gateway.messageStream$;
    
    readyStream$.subscribe(() => {
      console.log(`Logged in as ${gateway.botUser()?.tag}!`);
    });
    
    interactionStream$.subscribe( async (interaction) => {
      switch (interaction.commandName) {
        case "count":
          const name = interaction.options.get("name")?.value as string;
          const counter = await incrementCounter(name);
          const reply = displayMessage(counter);
          await interaction.reply(reply);
          break;
        case "hist":
          const userId = interaction.options.get("user")?.value as string;
          const summary = await fetchPlayerMatchHistory("origin", userId);
          const characterName =
            summary.data.items[0].matches[0].metadata.legend.displayValue;
          const characterUrl =
            summary.data.items[0].matches[0].metadata.legendPortraitImageUrl
              .value;
          const killStat = summary.data.items[0].stats.kills.value;
          const rankScoreChange =
            summary.data.items[0].stats.rankScoreChange.value;
          const apexEmbed = new EmbedBuilder()
            .setColor("DarkGrey")
            .setTitle(`Played as ${characterName}`)
            .setDescription(":EZ:")
            .setThumbnail(characterUrl)
            .addFields(
              { name: "Kills", value: killStat + "", inline: true },
              { name: "RP Change", value: rankScoreChange + "", inline: true }
            );
          await interaction.reply({ embeds: [apexEmbed] });
          break;
      }
    });
    
    messageStream$.subscribe( async (message) => {
      if (message.author.bot) return;
      let mess = message.content;
      await anaylzeSpelling(mess, 0.05, async (wordInMessage) => {
        if (!checker.correct(wordInMessage)) {
          let sugg: string[] = checker.suggest(wordInMessage);
          const emote = gateway.emojis().cache.find(
            (emoji) => emoji.name === "5Head"
          );
          if (sugg.length > 0) {
            let reply = `${emote} I think you mean? ${sugg
              .slice(0, 3)
              .join(", ")}`;
            await message.reply(reply);
          } else {
            const emote = gateway.emojis().cache.find(
              (emoji) => emoji.name === "Pepega"
            );
            await message.reply(`${emote} wat`);
          }
        }
      });
      await fuckYouToo(mess, 0.5, async (replyMessage) => {
        const userToReply = message.author;
        await message.reply(`${userToReply} - ${replyMessage} 😠`);
      });
      await randomInsult(0.03, async (replyInsult) => {
        const userToReply = message.author;
        await message.reply(`${userToReply} - ${replyInsult}`);
      });
      await randomPun(0.03, async (replyPun) => {
        const userToReply = message.author;
        await message.reply(`${userToReply} - ${replyPun}`);
      });
    });
    gateway.login();
  })
  .catch((err) => {
    console.error(err);
  });