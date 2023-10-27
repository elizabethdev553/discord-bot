import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";

export const Help: Command = {
  name: "help",
  description: "Help page for the Joystream discord role bot",

  run: async (client: Client, interaction: CommandInteraction) => {
    const content = `Please follow this link to learn how to use the Joystream role bot. https://www.notion.so/joystream/Joystream-Role-Bot-c090b6d5f54c40509a736eb0a6201834?pvs=4    `;

    await interaction.followUp({
      ephemeral: true,
      content,
    });
  },
};
