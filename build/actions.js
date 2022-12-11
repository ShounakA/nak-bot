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
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomPun = exports.randomInsult = exports.fuckYouToo = exports.anaylzeSpelling = void 0;
const anaylzeSpelling = (message, chanceOfAction, cbAction) => __awaiter(void 0, void 0, void 0, function* () {
    var d = Math.random();
    var tokens = message.split(' ');
    if (tokens.length > 10)
        return;
    for (let word of tokens) {
        if (d < chanceOfAction)
            yield cbAction(word);
    }
});
exports.anaylzeSpelling = anaylzeSpelling;
const fuckYouToo = (message, chanceOfAction, cbAction) => __awaiter(void 0, void 0, void 0, function* () {
    var d = Math.random();
    if ((d < chanceOfAction) &&
        message.toLowerCase().includes('fuck you')) {
        yield cbAction("No fuck you.");
    }
});
exports.fuckYouToo = fuckYouToo;
const randomInsult = (chanceOfAction, cbAction) => __awaiter(void 0, void 0, void 0, function* () {
    var d = Math.random();
    if (d < chanceOfAction) {
        const insultResp = yield fetchInsult();
        yield cbAction(insultResp.insult);
    }
});
exports.randomInsult = randomInsult;
const randomPun = (chanceOfAction, cbAction) => __awaiter(void 0, void 0, void 0, function* () {
    var d = Math.random();
    if (d < chanceOfAction) {
        const punResp = yield fetchPun();
        yield cbAction(punResp.joke);
    }
});
exports.randomPun = randomPun;
// fetch data
const fetchInsult = () => __awaiter(void 0, void 0, void 0, function* () {
    const insultResp = yield fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json', {
        method: 'GET',
        headers: {
            "content-type": "application/json"
        }
    });
    return yield insultResp.json();
});
const fetchPun = () => __awaiter(void 0, void 0, void 0, function* () {
    const punResp = yield fetch('https://v2.jokeapi.dev/joke/Pun?blacklistFlags=racist,sexist&type=single', {
        method: 'GET',
        headers: {
            "content-type": "application/json"
        }
    });
    return yield punResp.json();
});
