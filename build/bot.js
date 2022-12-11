"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const { REST, Routes } = require('discord.js');
const nspell_1 = __importDefault(require("nspell"));
const dictionary_en_1 = __importDefault(require("dictionary-en"));
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
const actions_1 = require("./actions");
dotenv_1.default.config();
let checker = null;
const ondictionary = (err, dict) => {
    if (err)
        throw err;
    checker = (0, nspell_1.default)(dict);
};
(0, dictionary_en_1.default)(ondictionary);
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent] });
client.on('ready', () => {
    var _a;
    console.log(`Logged in as ${(_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
});
client.on('interactionCreate', (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'ping') {
        yield interaction.reply('Pong!');
    }
}));
client.on('messageCreate', (message) => __awaiter(void 0, void 0, void 0, function* () {
    if (message.author.bot)
        return;
    let mess = message.content;
    yield (0, actions_1.anaylzeSpelling)(mess, 0.05, (wordInMessage) => __awaiter(void 0, void 0, void 0, function* () {
        if (!checker.correct(wordInMessage)) {
            let sugg = checker.suggest(wordInMessage);
            const emote = client.emojis.cache.find(emoji => emoji.name === '5Head');
            let reply = `${emote} I think you mean? ${sugg.slice(0, 3).join(', ')}`;
            yield message.reply(reply);
        }
    }));
    yield (0, actions_1.fuckYouToo)(mess, 0.3, (replyMessage) => __awaiter(void 0, void 0, void 0, function* () {
        const userToReply = message.author;
        yield message.reply(`${userToReply} - ${replyMessage} 😠`);
    }));
    yield (0, actions_1.randomInsult)(0.05, (replyInsult) => __awaiter(void 0, void 0, void 0, function* () {
        const userToReply = message.author;
        yield message.reply(`${userToReply} - ${replyInsult}`);
    }));
    yield (0, actions_1.randomPun)(0.5, (replyPun) => __awaiter(void 0, void 0, void 0, function* () {
        const userToReply = message.author;
        yield message.reply(`${userToReply} - ${replyPun}`);
    }));
}));
client.login(process.env.DISCORD_BOT_TOKEN);
