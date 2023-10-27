import { RoleSelectMenuBuilder } from "@discordjs/builders";
import { GraphQLClient } from "graphql-request";

export interface MemberFieldFragment {
  id: string;
  handle: string;
  createAt: Date;
  isFoundingMember: boolean;
  isCouncilMember: boolean;
  rootAccount: string;
  externalResources: externalResources[];
  roles: [
    {
      status:
        | {
            __typename: string;
          }
        | {
            __typename: "WorkerStatusActive";
          }
        | {
            __typename: "WorkerStatusLeaving";
          }
        | {
            __typename: "WorkerStatusLeft";
          }
        | {
            __typename: "WorkerStatusTerminated";
          };
      groupId: string;
      isLead: boolean;
    }
  ];
}
export interface externalResources {
  type: string;
  value: string;
}
export interface RoleMember {
  status: {
    __typename: string;
  };
  groupId?: string;
  isLead?: boolean;
}

export interface Member {
  id: string;
  handle: string;
  isFoundingMember: boolean;
  isCouncilMember: boolean;
  rootAccount: string;
  externalResources: externalResources[];
  roles: RoleMember[];
}

export const asMember = (member: MemberFieldFragment): Member => {
  return {
    id: member.id,
    handle: member.handle,
    isFoundingMember: member.isFoundingMember,
    isCouncilMember: member.isCouncilMember,
    rootAccount: member.rootAccount,
    externalResources: member.externalResources,
    roles: member.roles,
  };
};

export async function getMembers() {
  const graphQLClient = new GraphQLClient(
    process.env.QUERY_NODE || "https://query.joystream.org/graphql"
  );

  const query = `
    query getMembers {
        memberships(limit: 500000) {
          id
          handle
          createdAt
          isFoundingMember
          isCouncilMember
          rootAccount
          externalResources {
            type
            value
          }
          roles {
            status {
              ... on WorkerStatusActive {
                __typename
              }
              ... on WorkerStatusLeaving {
                __typename
              }
              ... on WorkerStatusLeft {
                __typename
              }
              ... on WorkerStatusTerminated {
                __typename
              }
            }
            groupId
            isLead
          }
        }
    }
  `;

  const variables = {};
  try {
    const data: any = await graphQLClient.request(query, variables);
    const members = data.memberships.map((membership: MemberFieldFragment) => {
      return asMember(membership);
    });
    return members;
  } catch (error) {
    console.error(error);
    return [];
  }
}
