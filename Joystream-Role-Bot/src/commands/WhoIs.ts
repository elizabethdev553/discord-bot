import {
  CommandInteraction,
  Client,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import { getUserId } from "../controls/control";

export const WhoIs: Command = {
  name: "who_is",
  description: "List member id and on-chain roles of the given discord account",
  options: [
    {
      name: "discord_handle",
      description:
        "The discord Username of which you wish to display information",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  run: async (client: Client, interaction: CommandInteraction) => {
    let content: string = `who is`;
    const { options } = interaction;

    const discordHandle: string = String(options.get("discord_handle")?.value);
    const userId = discordHandle.replace(/[<@!>]/g, "");

    const guild = client.guilds.cache.get(String(process.env.SERVER_ID));

    if (!guild) {
      content = "Guild not found.";
    } else {
      await guild.members.fetch();
      const member = guild.members.cache.get(userId);

      if (!member) {
        content = `Discord name: Oops, this member does not exist :grimacing: 
        To create a membership with Pioneer Governance, please go to the app page https://pioneerapp.xyz/#/profile/memberships `;
      } else {
        const memberId = getUserId(member.user.username);

        if (memberId) {
          if (memberId.roles?.length == 0) {
            content = `Discord name:  <@${userId}> \n
            Joystream Member ID:  ${memberId.id} \n
            On-chain roles: This Member does not have any role on-chain :frowning2: 
            `;
          } else {
            content = `Discord name:  <@${userId}> \n
            Joystream Member ID:  ${memberId.id} \n
            On-chain roles:<@&${memberId.roles?.join(">, <@&")}>`;
          }
        } else {
          content = `Discord name:  <@${userId}> \n
          Hey   <@${userId}> ! To link your Discord account to your Joystream membership, please go to the Pioneer Governance app and update your membership data https://pioneerapp.xyz/#/profile/memberships  \n
          `;
        }
      }
    }

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
