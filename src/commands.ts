import dotenv from "dotenv";
import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from "discord.js";

dotenv.config();
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? "";
const CLIENT_ID = process.env.CLIENT_ID ?? "";

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);
export const configCommands = async (
  commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
) => {
  try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};
