import { Command } from "./Command";
import { Help } from "./commands/Help";
import { Status } from "./commands/Status";
import { WhoIs } from "./commands/WhoIs";
import { ListRoleMembers } from "./commands/ListRoleMembers";

export const Commands: Command[] = [Status, Help, WhoIs, ListRoleMembers];
