import { SlashCommandBuilder } from 'discord.js';
import { filter, from, switchMap, tap } from 'rxjs';
import { injectable } from 'tsyringe';
import { Gateway } from '../gateway';

@injectable()
export class Ping {
  private commandName = 'ping';
  private description = 'Ping the bot server';
  constructor(private gateway: Gateway) {
    this.gateway.interactionStream$
      .pipe(
        filter((interaction) => interaction.commandName === this.commandName),
        switchMap((interaction) => {
          const createdAt = interaction.createdTimestamp;
          const nowAt = Date.now();
          const diff = nowAt - createdAt;
          return from(interaction.reply(`Pong! - replied in: ${diff}ms`));
        })
      )
      .subscribe((reply) => {
        console.log(`Replied to ${reply.interaction.user.username}`);
      });
  }

  public command() {
    return new SlashCommandBuilder()
      .setName(this.commandName)
      .setDescription(this.description);
  }
}
