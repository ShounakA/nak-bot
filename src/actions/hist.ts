import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { filter, from, mergeMap } from "rxjs";
import { inject, injectable } from "tsyringe";
import { Gateway } from "../gateway";

@injectable()
export class Hist {
  public commandName = "hist";
  public desc = "Get Apex Legends match history of a player.";
  constructor(
    private gateway: Gateway,
    @inject("TRN_API_KEY") private trn_key: string
  ) {
    this.gateway.interactionStream$
      .pipe(
        filter((interaction) => interaction.commandName === this.commandName),
        mergeMap((interaction) => {
          const userId = interaction.options.get("user")?.value as string;
          return this.fetchPlayerMatchHistory("origin", userId).pipe(
            mergeMap((summary) => {
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
                  {
                    name: "RP Change",
                    value: rankScoreChange + "",
                    inline: true,
                  }
                );
              return from(interaction.reply({ embeds: [apexEmbed] }));
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
          .setName("user")
          .setDescription("origin user name.")
          .setRequired(true)
      );
  }
  private fetchPlayerMatchHistory(platform: string, userId: string) {
    return from(
      fetch(
        `https://public-api.tracker.gg/v2/apex/standard/profile/${platform}/${userId}/sessions`,
        {
          method: "GET",
          headers: {
            "TRN-Api-Key": this.trn_key,
          },
        }
      )
    ).pipe(mergeMap((trackerResp) => from(trackerResp.json())));
  }
}
