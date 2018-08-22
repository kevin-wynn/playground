# playground
A slack app used to keep track of sandboxes and teams

## Mongo setup
Create a mongo database - you can use environment variables to set up the database connection like so:
`.env file`
```javascript
{
  process.env.mongoUsername: 'username'
  process.env.mongoPassword: 'password'
  process.env.mongoCluster: 'clusterName'
}
```

## Slack commands
`/playground team help` - Display all the commands available for teams
`/playground sandbox help` - Display all the commands available for sandboxes
`/playground sandbox` - See all sandboxes registered
`/playground sandbox register {sandboxName} {optionalAlias}` - Registers a box with a sandbox name, and an optional alias that you can use
`/playground sandbox update {sandboxName} {newalias}` - Updates a sandbox to assign it a new or updated alias
`/playground sandbox delete {sandboxName}` - Deletes a sandbox by name
`/playground sandbox team {teamName}` - Shows sandboxes for a given team
`/playground sandbox take {sandboxName}` - Registers a sandbox for current user if available, otherwise prompts to take it from existing user
`/playground sandbox leave {sandboxName}` - Cleans a sandbox of its current user if available
`/playground team` - See all teams in the playground
`/playground team register {teamName} {optional:teamColor}` - Registers a team with a team name, and an optional team color that you can use
`/playground team update {teamName} {newColor}` - Updates a team to assign it a new or updated color
`/playground team delete {teamName}` - Deletes a team by name
`/playground team sandbox {teamName} {sandboxName}` - Registers a sandbox to a team by teamname and sandboxname