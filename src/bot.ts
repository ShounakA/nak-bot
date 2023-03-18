import dictionaryEn from "dictionary-en";
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  SlashCommandBuilder,
  CacheType,
  Interaction,
  ChatInputCommandInteraction,
} from "discord.js";
import dotenv from "dotenv";
import NSpell from "nspell";
import { filter, fromEvent, map } from "rxjs";

import {
  anaylzeSpelling,
  counters,
  createCounter,
  displayMessage,
  fetchPlayerMatchHistory,
  fuckYouToo,
  incrementCounter,
  randomInsult,
  randomPun,
} from "./actions";
import { configCommands } from "./commands";

dotenv.config();

let checker: any = null;
const ondictionary = (err: any, dict: any) => {
  if (err) throw err;
  checker = NSpell(dict);
};
dictionaryEn(ondictionary);

const roboCommand = new SlashCommandBuilder()
  .setName("robo")
  .setDescription("Generate a robot from you name")
  .addStringOption((option) =>
    option
      .setName("seed")
      .setDescription("make your robot more special.")
      .setRequired(false)
  );

const counterManageCommand = new SlashCommandBuilder()
  .setName("counter")
  .setDescription("Manage all the counters.")
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Create a counter. All counter are public.")
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription(
            "Make a specific counter with name. Name must be unique."
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("display")
          .setDescription(
            "The display message when you get the value. Add '{%d}' to your message for the value position."
          )
          .setMaxLength(150)
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("list")
      .setDescription("Get all counters. All counters are currently public.")
  );

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

const ping = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Ping the bot server");

const commands = [
  roboCommand.toJSON(),
  counterManageCommand.toJSON(),
  countCommand.toJSON(),
  matchHistoryCommand.toJSON(),
  ping.toJSON(),
];

configCommands(commands)
  .then((result) => {
    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    const readyStream$ = fromEvent(client, "ready");
    const interactionStream$ = fromEvent(client, "interactionCreate").pipe(
      filter((interaction) =>
        (interaction as Interaction<CacheType>).isChatInputCommand()
      ),
      map(
        (interaction) => interaction as ChatInputCommandInteraction<CacheType>
      )
    );

    readyStream$.subscribe(() => {
      console.log(`Logged in as ${client?.user?.tag}!`);
    });

    interactionStream$.subscribe(async (interaction) => {
      switch (interaction.commandName) {
        case "ping":
          const createdAt = interaction.createdTimestamp;
          const nowAt = Date.now();
          const diff = nowAt - createdAt;
          await interaction.reply(`Pong! - replied in: ${diff}ms`);
          break;
        case "robo":
          const seed = interaction.options.get("seed")?.value;
          const query = !seed
            ? encodeURI(interaction.user.username)
            : encodeURI(`${interaction.user.username}+${seed}`);
          const image = `https://www.robohash.org/${query}`;
          const embed = new EmbedBuilder()
            .setColor("DarkGrey")
            .setTitle("Your Robot")
            .setImage(image);

          await interaction.reply({ embeds: [embed] });
          break;
        case "counter":
          switch (interaction.options.getSubcommand()) {
            case "list":
              const counterList = await counters();
              const names = counterList.map((ctr) => ctr.name);
              await interaction.reply(`Counters -> ${names}`);
              break;
            case "create":
              const optName = interaction.options.get("name")?.value as string;
              const optDisplay = interaction.options.get("display")
                ?.value as string;
              const newCtr = await createCounter(optName, optDisplay);
              await interaction.reply(
                `New counter created! ${newCtr.name} -> ${newCtr.message}`
              );
              break;
          }
          break;
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

    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      let mess = message.content;
      await anaylzeSpelling(mess, 0.05, async (wordInMessage) => {
        if (!checker.correct(wordInMessage)) {
          let sugg: string[] = checker.suggest(wordInMessage);
          const emote = client.emojis.cache.find(
            (emoji) => emoji.name === "5Head"
          );
          if (sugg.length > 0) {
            let reply = `${emote} I think you mean? ${sugg
              .slice(0, 3)
              .join(", ")}`;
            await message.reply(reply);
          } else {
            const emote = client.emojis.cache.find(
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

    client.login(process.env.DISCORD_BOT_TOKEN);
  })
  .catch((err) => {
    console.log(err);
  });
