import { CommandInteraction, Client } from "discord.js";
import { Command } from "../Command";
import { blockNumber } from "../hook/blockCalc";
import { qn_recive_data } from "../controls/control";

export const Status: Command = {
  name: "status",
  description: "status",

  run: async (client: Client, interaction: CommandInteraction) => {
    let emptyRole: string = "status";

    const guild = client.guilds.cache.get(String(process.env.SERVER_ID));
    let status: string = "";
    let rpcStatus: string = "";

    if (!guild) {
      emptyRole = "Discord Server not found.";
    } else {
      await guild.roles.fetch();

      const roles = guild.roles.cache.filter((role) => role.members.size === 0);
      const roleNames = roles.map((role) => role.id);
      if (Number(blockNumber) === 0) {
        rpcStatus = `Cannot connect to ${process.env.RPC_URL}`;
      } else {
        rpcStatus = `RPC is Active`;
      }
      if (!qn_recive_data || qn_recive_data.length === 0) {
        status = ` - Cannot connect to ${process.env.QUERY_NODE}`;
      } else {
        status = " - QN is Active";
      }

      if (roleNames.length === 0) {
        emptyRole = `All roles have been filled`;
      } else {
        emptyRole = `Empty Roles : <@&${roleNames.join(">, <@&")}>`;
      }
    }

    const content: string = `

    ${emptyRole}\n

    Status:\n ${status}\n ${rpcStatus}
    
    Last Updated at Block : ${blockNumber}
    
    Version :${process.env.VERSION}
    `;

    await interaction.followUp({
      content,
      ephemeral: true,
    });
  },
};
