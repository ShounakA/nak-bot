import 'reflect-metadata';
import { container } from 'tsyringe';

import dictionaryEn from 'dictionary-en';
import NSpell from 'nspell';
import {
  anaylzeSpelling,
  fuckYouToo,
  randomInsult,
  randomPun,
} from './responses';

import { Gateway } from './gateway';
import { App } from './app';
import { startup } from './startup';
import { Ping } from './actions/ping';
import { Robo } from './actions/robo';
import { Counter } from './actions/counter';
import { Count } from './actions/count';
import { Hist } from './actions/hist';

let checker: any = null;
const ondictionary = (err: any, dict: any) => {
  if (err) throw err;
  checker = NSpell(dict);
};
dictionaryEn(ondictionary);

// Startup the program by registering all your services.
// Do this before you start resolving. instances
startup();

// Resolve the gateway client and the app.
// These should be resolved before any action.
const gateway = container.resolve(Gateway);
const app = container.resolve(App);

// Iteractions
const ping = container.resolve(Ping);
const robo = container.resolve(Robo);
const counterManage = container.resolve(Counter);
const counter = container.resolve(Count);
const hist = container.resolve(Hist);

//Slash Commands and their Schema
const commands = [
  robo.command().toJSON(),
  counterManage.command().toJSON(),
  counter.command().toJSON(),
  hist.command().toJSON(),
  ping.command().toJSON(),
];

// Register the bots commands, then get the event streams, and login.
app
  .start(commands)
  .then((_result) => {
    const readyStream$ = gateway.readyStream$;
    const messageStream$ = gateway.messageStream$;
    readyStream$.subscribe(() => {
      console.log(`Logged in as ${gateway.botUser()?.tag}!`);
    });
    messageStream$.subscribe(async (message) => {
      if (message.author.bot) return;
      let mess = message.content;
      await anaylzeSpelling(mess, 0.05, async (wordInMessage) => {
        if (!checker.correct(wordInMessage)) {
          let sugg: string[] = checker.suggest(wordInMessage);
          const emote = gateway
            .emojis()
            .cache.find((emoji) => emoji.name === '5Head');
          if (sugg.length > 0) {
            let reply = `${emote} I think you mean? ${sugg
              .slice(0, 3)
              .join(', ')}`;
            await message.reply(reply);
          } else {
            const emote = gateway
              .emojis()
              .cache.find((emoji) => emoji.name === 'Pepega');
            await message.reply(`${emote} wat`);
          }
        }
      });
      await fuckYouToo(mess, 0.5, async (replyMessage) => {
        const userToReply = message.author;
        await message.reply(`${userToReply} - ${replyMessage} 😠`);
      });
      await randomInsult(0.03, async (replyInsult) => {
        const userToReply = message.author;
        await message.reply(`${userToReply} - ${replyInsult}`);
      });
      await randomPun(0.03, async (replyPun) => {
        const userToReply = message.author;
        await message.reply(`${userToReply} - ${replyPun}`);
      });
    });

    gateway.login();
  })
  .catch((err) => {
    console.error(err);
  });
