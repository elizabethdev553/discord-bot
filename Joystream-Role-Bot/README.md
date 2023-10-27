### How to use


## /who_is

List member id and on-chain roles of the given discord account
`discord_handle`: the discord Usename of which you wish to display information 

example: /who_is accxyz

## /list_role_members

List the  discord usernames who have the specified discord role
`discord_role`: The command will display users with this role

example: /discord_role “Founding Member”

## /status

Displays the following information
- on-chain roles that are empty
- what version of bot is running.
- last block where synchronization happened (assuming its poll based as above), current

## /help

Link the user to this help page.

### Setup
In order to start the discord bot server and connect it to the Joystream discord server, the admin must follow the next steps.
- Setup a mongodb server
- Configure the env file.
SERVER_TOKEN = discord server token
VERSION= version number
QUERY_NODE= URL of Joystream QN
RPC_URL= URL of Joystream RPC
SYNCH_TIME = time of synchronization in minutes
- Start the server