import dotenv from "dotenv";
import { Client, GatewayIntentBits, REST } from "discord.js";
import { container } from "tsyringe";

/**
 * This function will startup all the bot services.
 * All the services, client, and configs should all be registered here.
 */
export function startup() {
  dotenv.config();
  const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";
  const CLIENT_ID = process.env.CLIENT_ID ?? "";
  const TRN_API_KEY = process.env.TRACK_TOKEN ?? "";
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });
  const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

  container.register("BOT_TOKEN", { useValue: BOT_TOKEN });
  container.register("CLIENT_ID", { useValue: CLIENT_ID });
  container.register("TRN_API_KEY", { useValue: TRN_API_KEY });
  container.register<Client>(Client, { useValue: client });
  container.register<REST>(REST, { useValue: rest });
}
