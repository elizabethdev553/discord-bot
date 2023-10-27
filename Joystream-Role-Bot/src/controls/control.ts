import { Client, CommandInteraction } from "discord.js";
import {
  MemberFieldFragment,
  getMembers,
} from "../query/generator/members_generate";
import { RoleAddress } from "../RoleConfig";
import { WsProvider } from "@polkadot/rpc-provider";
import { ApiPromise } from "@polkadot/api";
import { upDateBlockNumber } from "../hook/blockCalc";

export let qn_recive_data: MemberFieldFragment[] = [];

const provider = new WsProvider(process.env.RPC_URL);

type RoleMap = {
  [key: string]: [string, string];
};

const roleMap: RoleMap = {
  contentWorkingGroup: [
    RoleAddress.contentWorkingGroupLead,
    RoleAddress.contentWorkingGroup,
  ],
  forumWorkingGroup: [
    RoleAddress.forumWorkingGroupLead,
    RoleAddress.forumWorkingGroup,
  ],
  appWorkingGroup: [
    RoleAddress.appWorkingGroupLead,
    RoleAddress.appWorkingGroup,
  ],
  membershipWorkingGroup: [
    RoleAddress.membershipWorkingGroupLead,
    RoleAddress.membershipWorkingGroup,
  ],
  distributionWorkingGroup: [
    RoleAddress.distributionWorkingGroupLead,
    RoleAddress.distributionWorkingGroup,
  ],
  storageWorkingGroup: [
    RoleAddress.storageWorkingGroupLead,
    RoleAddress.storageWorkingGroup,
  ],
  operationsWorkingGroupAlpha: [
    RoleAddress.operationsWorkingGroupAlphaLead,
    RoleAddress.operationsWorkingGroupAlpha,
  ],
  operationsWorkingGroupBeta: [
    RoleAddress.operationsWorkingGroupBetaLead,
    RoleAddress.operationsWorkingGroupBeta,
  ],
  operationsWorkingGroupGamma: [
    RoleAddress.operationsWorkingGroupGammaLead,
    RoleAddress.operationsWorkingGroupGamma,
  ],
};

export const setMemberRole = async (
  client: Client,
  interaction: CommandInteraction
): Promise<void> => {
  const Qndata: MemberFieldFragment[] = await getMembers();

  const api = await ApiPromise.create({ provider });

  console.log("Discord server update finish!");

  if (!api) {
    upDateBlockNumber("RPC endpoint disconnected");
    return;
  }

  await api?.rpc.chain.subscribeNewHeads((header) => {
    upDateBlockNumber(header.number.toString());
  });

  const guild = client.guilds.cache.get(String(process.env.SERVER_ID));
  if (!guild) {
    console.log("Guild not found.");
    return;
  }

  await guild.members.fetch();
  const members = guild.members.cache.filter((member) => !member.user.bot);

  let buffer: MemberFieldFragment[] = [];

  Qndata.map((qndata) => {
    qndata.externalResources
      .filter((qndata) => qndata.type === "DISCORD")
      .map((exteranldata) => {
        members
          .filter((member) => member.user.username === exteranldata.value)
          .map(() => {
            buffer.push(qndata);
          });
      });
  });

  if (!buffer || buffer.length === 0) return;

  qn_recive_data = buffer;

  buffer.map(async (filterqn) => {
    // set role to discord server.
    const discord_handle = filterqn.externalResources.filter(
      (data) => data.type === "DISCORD"
    );

    // remove roles of user

    const member = members
      .filter((d) => d.user.username === discord_handle[0].value)
      .map(async (member) => {
        return member;
      });

    try {
      members.forEach(async (member) => {
        await member.roles.remove(member.roles.cache);
        console.log(`Roles of member ${member.user.tag} have been removed.`);
      });
    } catch (error) {
      console.error("Error removing member roles:", error);
    }

    if (!member) {
      return;
    }

    (await member[0]).roles.add(RoleAddress.membershipLinked);

    filterqn.roles.map(async (groupID) => {
      if (!roleMap[groupID.groupId]) return;

      const [leadAddress, workerAddress] = roleMap[groupID.groupId];
      const address = groupID.isLead ? leadAddress : workerAddress;
      const role = await guild.roles.fetch(address);

      if (!role) {
        console.log(`<@&${address}> Role not found`);
        return;
      }

      groupID.status.__typename === "WorkerStatusActive"
        ? (await member[0]).roles.add(role)
        : (await member[0]).roles.remove(role);
    });

    /// concile, founding, creator part  ///
    const qnRoleData = [
      {
        roleAddress: RoleAddress.foundingMember,
        isState: filterqn.isFoundingMember,
      },
      {
        roleAddress: RoleAddress.councilMember,
        isState: filterqn.isCouncilMember,
      },
      {
        roleAddress: RoleAddress.creator,
        isState: false, // update part //      ----------?
      },
    ];

    qnRoleData.map(async (qn) => {
      const role = await guild.roles.fetch(qn.roleAddress);
      if (!role) {
        console.log(`<@&${qn.roleAddress}> Role not found`);
        return;
      }

      qn.isState
        ? (await member[0]).roles.add(role)
        : (await member[0]).roles.remove(role);
    });
  });
};

interface MemberRolesAndId {
  id: string;
  roles?: string[];
}

export const getUserId = (userId: string): MemberRolesAndId | undefined => {
  if (!qn_recive_data) return;

  let id: MemberFieldFragment[] = [];
  let role: string[] = [];

  qn_recive_data.map((data) =>
    data.externalResources
      .filter((data) => data.type === "DISCORD" && data.value === userId)
      .map(() => {
        data.roles.map(async (groupID) => {
          if (!roleMap[groupID.groupId]) return;

          const [leadAddress, workerAddress] = roleMap[groupID.groupId];
          const address = groupID.isLead ? leadAddress : workerAddress;

          role.push(address);
        });

        if (data.isFoundingMember) role.push(RoleAddress.foundingMember);
        if (data.isCouncilMember) role.push(RoleAddress.councilMember);

        id.push(data);
      })
  );

  if (!id || id.length === 0) return;

  return {
    id: id[0].id,
    roles: role,
  };
};
