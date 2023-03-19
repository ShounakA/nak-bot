import { Counter } from '@prisma/client';
import { SlashCommandBuilder } from 'discord.js';
import { filter, from, exhaustMap, catchError } from 'rxjs';
import { injectable } from 'tsyringe';
import { Prisma } from '../db/prisma';
import { Gateway } from '../gateway';

@injectable()
export class Count {
  public commandName = 'count';
  public desc = 'Increment a specific counter';

  constructor(private gateway: Gateway, private prisma: Prisma) {
    this.gateway.interactionStream$
      .pipe(
        filter((interaction) => interaction.commandName === this.commandName),
        exhaustMap((interaction) => {
          const name = interaction.options.get('name')?.value as string;
          return this.incrementCounter(name).pipe(
            exhaustMap((counter) => {
              const reply = this.displayMessage(counter);
              return from(interaction.reply(reply));
            }),
            catchError((error) => {
              console.error(error.message);
              return from(interaction.reply(error.message as string));
            })
          );
        })
      )
      .subscribe((reply) => {
        console.log(`Replied to ${reply.interaction.user.username}`);
      });
  }

  public command() {
    return new SlashCommandBuilder()
      .setName(this.commandName)
      .setDescription(this.desc)
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription(
            'Name of the counter to increment. Get all counter with `/counter list`'
          )
          .setRequired(true)
      );
  }

  private incrementCounter(name: string) {
    const currCounter$ = from(
      this.prisma.db.counter.findFirst({ where: { name } })
    );
    return currCounter$.pipe(
      exhaustMap((ctr) => {
        if (ctr == null)
          throw new Error(`Could not find counter with name: ${name}`);
        return this.prisma.db.counter.update({
          where: { name },
          data: { value: ctr.value + 1 },
        });
      })
    );
  }

  private displayMessage(counter: Counter) {
    const msg = counter.message;
    const val = counter.value + '';
    if (msg.includes('{%d}')) return msg.replace('{%d}', val);
    else return `${msg}: ${val}`;
  }
}
