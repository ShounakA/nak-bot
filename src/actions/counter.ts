import { SlashCommandBuilder } from "discord.js";
import { concatMap, filter, from, map, mergeAll, switchMap, toArray } from "rxjs";
import { injectable } from "tsyringe";
import { Prisma } from "../db/prisma";
import { Gateway } from "../gateway";

@injectable()
export class Counter {
   private commandName ="counter";
   private description = "Manage all the counters.";

   constructor(private gateway: Gateway, private prisma: Prisma) {
      const counter$ = this.gateway.interactionStream$.pipe(
         filter((interaction) => interaction.commandName === this.commandName)
       );
       counter$.pipe(
         filter((interaction) => interaction.options.getSubcommand() === "list"),
         switchMap((interaction) => this.getCounters().pipe(
           mergeAll(),
           map((ctr) => ctr.name),
           toArray(),
           switchMap((names) => from(interaction.reply(`Counters -> ${names}`))),
         ))
       ).subscribe((reply) => {
         console.log(`Replied to ${reply.interaction.user.username}`);
       });

       counter$.pipe(
         filter((interaction) => interaction.options.getSubcommand() === "create"),
         switchMap((interaction) => {
            const optName = interaction.options.get("name")?.value as string;
            const optDisplay = interaction.options.get("display")?.value as string;
            return this.createCounter(optName, optDisplay).pipe(
               concatMap((newCtr) => from(interaction.reply(
                  `New counter created! ${newCtr.name} -> ${newCtr.message}`
                )))
              );
         })
       ).subscribe((reply) => {
         console.log(`Replied to ${reply.interaction.user.username}`);
       });
   }

   public command() {
      return new SlashCommandBuilder()
      .setName(this.commandName)
      .setDescription(this.description)
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
    
   }

   private getCounters() {
      return from(this.prisma.db.counter.findMany());
   }

   private createCounter(name: string, message: string){
    const newCtr = from(this.prisma.db.counter.create({
      data: {
        name,
        message,
      },
    }));
    return newCtr;
   }
}