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

