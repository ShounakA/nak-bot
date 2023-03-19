# nak-bot

## Initialize the Dev Env

- run `yarn install`
- setup a .env file with three vars
  - DISCORD_BOT_TOKEN
  - CLIENT_ID
  - DATABASE_URL
- run `yarn db:devproxy` to setup a dev db connection
- if on fresh db branch `yarn db:push`
  - then `yarn db:seed` to start with some dummy data

## Details

`bot.ts` is the entry point.

- startup the bot services
- register the app commands to discord gateway api
- listen for ready, interaction create, and message create events.

## Adding a bot interaction.

- add class to src/actions/
  - with @injectable() decorator
- inside `bot.ts` resolve the instance from the container and start calling it.
