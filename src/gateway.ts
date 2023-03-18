import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  Message,
} from "discord.js";
import { filter, fromEvent, map } from "rxjs";
import { inject, injectable } from "tsyringe";

/**
 * Class to interact with Discord Gateway API
 */
@injectable()
export class Gateway {
  
  /**
   * Constructor to create a discord gateway client.
   * @param client Discord Gateway client
   * @param bot_token discord bot token
   */
  constructor(
    @inject(Client) private client: Client,
    @inject("BOT_TOKEN") private bot_token: string
  ) {}

  /**
   * 'ready' event stream
   */
  public readyStream$ = fromEvent(this.client, "ready");

  /**
   * 'interactionCreate' event stream
   */
  public interactionStream$ = fromEvent(this.client, "interactionCreate").pipe(
    filter((interaction) =>
      (interaction as Interaction<CacheType>).isChatInputCommand()
    ),
    map((interaction) => interaction as ChatInputCommandInteraction<CacheType>)
  );

  /**
   * 'messageCreate' event stream
   */
  public messageStream$ = fromEvent(this.client, "messageCreate").pipe(
    map((message) => message as Message<boolean>)
  );

  /**
   * Login in to discord via the gateway client.
   */
  public login() {
    this.client.login(this.bot_token);
  }

  /**
   * Get the emoji manager.
   * @returns BaseGuildEmojiManager
   */
  public emojis() {
    return this.client.emojis;
  }

  /**
   * Get the bot user.
   * @returns ClientUser
   */
  public botUser() {
    if (!this.client.user)
      throw new Error("Unexpected no client user. Reload the bot?");
    return this.client.user;
  }
}
