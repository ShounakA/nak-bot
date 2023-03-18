import { REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from "discord.js";
import { inject, injectable } from "tsyringe";

@injectable()
export class Bot {
   
   constructor(@inject(REST) private rest: REST, @inject("CLIENT_ID") private client_id: string) {}

   public async start(commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
      console.log("Started refreshing application (/) commands.");
      await this.rest.put(Routes.applicationCommands(this.client_id), { body: commands });
      console.log("Successfully reloaded application (/) commands.");
   }
}