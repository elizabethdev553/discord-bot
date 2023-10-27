import {
  CommandInteraction,
  Client,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";

export const ListRoleMembers: Command = {
  name: "list_role_members",
  description: "List the discord usernames who have the specified discord role",
  options: [
    {
      name: "discord_role",
      description: "The command will display users with this role",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  run: async (client: Client, interaction: CommandInteraction) => {
    const { options } = interaction;

    const discordRole = String(options.get("discord_role")?.value);
    const roleId = discordRole?.replace(/[<@&!>]/g, "");

    let content: string = "list role members";
    const guild = client.guilds.cache.get(String(process.env.SERVER_ID));

    if (!guild) {
      content = "Guild not found.";
    } else {
      const role = guild.roles.cache.find((role) => {
        return role.id === roleId;
      });

      if (!role) {
        content = `Role <@&${roleId}> not found.`;
      } else {
        await guild.members.fetch();
        const members = guild.members.cache.filter((member) =>
          member.roles.cache.has(role.id)
        );
        const memberNames = members.map((member) => member.user.id);
        if (memberNames.length === 0) {
          content = `No members currently have the <@&${roleId}> :shushing_face: `;
        } else {
          content = `<@&${roleId}>: <@${memberNames.join(">, <@")}>`;
        }
      }
    }

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
