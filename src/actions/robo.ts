import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { filter, from, switchMap } from 'rxjs';
import { injectable } from 'tsyringe';
import { Gateway } from '../gateway';

@injectable()
export class Robo {
  private commandName = 'robo';
  private description = 'Generate a robot from you name';
  private opt1Name = 'seed';
  private opt1Desc = 'Make your robot more special.';
  constructor(private gateway: Gateway) {
    this.gateway.interactionStream$
      .pipe(
        filter((interaction) => interaction.commandName === this.commandName),
        switchMap((interaction) => {
          const seed = interaction.options.get('seed')?.value;
          const query = !seed
            ? encodeURI(interaction.user.username)
            : encodeURI(`${interaction.user.username}+${seed}`);
          const image = `https://www.robohash.org/${query}`;
          const embed = new EmbedBuilder()
            .setColor('DarkGrey')
            .setTitle('Your Robot')
            .setImage(image);

          return from(interaction.reply({ embeds: [embed] }));
        })
      )
      .subscribe((reply) => {
        console.log(`Replied to ${reply.interaction.user.username}`);
      });
  }

  public command() {
    return new SlashCommandBuilder()
      .setName(this.commandName)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName(this.opt1Name)
          .setDescription(this.opt1Desc)
          .setRequired(false)
      );
  }
}
