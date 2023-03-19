import {
  REST,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import { inject, injectable } from 'tsyringe';

/**
 * This class will register you app with discord gateweay API, as well as the commands.
 */
@injectable()
export class App {
  constructor(
    @inject(REST) private rest: REST,
    @inject('CLIENT_ID') private client_id: string
  ) {}

  /**
   * Start the application
   * @param commands list of interaction commands to register
   */
  public async start(
    commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]
  ) {
    console.log('Started refreshing application (/) commands.');
    await this.rest.put(Routes.applicationCommands(this.client_id), {
      body: commands,
    });
    console.log('Successfully reloaded application (/) commands.');
  }
}
