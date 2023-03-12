import { Counter } from "@prisma/client";
import { db } from "./db/client";

const TRN_API_KEY = process.env.TRACK_TOKEN ?? '';

export const anaylzeSpelling = async (
   message: string,
   chanceOfAction: number, 
   cbAction: (wordInMessage: string) => Promise<void>
) => 
{
      var d = Math.random();
      var tokens = message.split(' ');
      if (tokens.length > 10) return;
      for (let word of tokens) {
         if (d < chanceOfAction) await cbAction(word);
      }
};

export const fuckYouToo = async ( 
   message: string,
   chanceOfAction: number,
   cbAction: (replyMessage: string) => Promise<void>
) => {
   var d = Math.random();
   if (
      (d < chanceOfAction) && 
      message.toLowerCase().includes('fuck you')) {
      await cbAction("No fuck you.");
   }
};

export const randomInsult = async (
   chanceOfAction: number,
   cbAction: (replyMessage: string) => Promise<void>
) => {
   var d = Math.random();
   if (d < chanceOfAction) {
      const insultResp = await fetchInsult();
      await cbAction(insultResp.insult);
   }
};

export const randomPun = async (
   chanceOfAction: number,
   cbAction: (replyMessage: string) => Promise<void>
) => {
   var d = Math.random();
   if (d < chanceOfAction) {
      const punResp = await fetchPun();
      await cbAction(punResp.joke);
   }
};

// fetch data
const fetchInsult = async () => {
   const insultResp = await fetch('https://evilinsult.com/generate_insult.php?lang=en&type=json', 
   {
      method: 'GET',
      headers: {
         "content-type": "application/json"
      }
   });
   return await insultResp.json();
};

const fetchPun = async () => {
   const punResp = await fetch('https://v2.jokeapi.dev/joke/Pun?blacklistFlags=racist,sexist&type=single', 
   {
      method: 'GET',
      headers: {
         "content-type": "application/json"
      }
   });
   return await punResp.json();
};

export const counters = async () => {
   return await db.counter.findMany();
}

export const createCounter = async (name: string, message: string) => {
   const newCtr = await db.counter.create({
      data: {
         name,
         message,
      }
   })
   return newCtr;
}

export const incrementCounter = async (name: string) => {
   const currCounter = await db.counter.findFirst({ where: { name }});
   if (currCounter == null) throw new Error(`Could not find counter with name: ${name}`);
   
   const incCounter = db.counter.update({
      where: { name },
      data: { value: currCounter.value + 1 }
   })
   return incCounter;
}

export const displayMessage = (counter: Counter) => {
   const msg = counter.message;
   const val = counter.value + '';
   if (msg.includes('{%d}'))
      return msg.replace('{%d}', val);
   else 
      return `${msg}: ${val}`;
}

export const fetchPlayerMatchHistory = async (platform: string, userId: string) => {

   const trackerResp = await fetch(`https://public-api.tracker.gg/v2/apex/standard/profile/${platform}/${userId}/sessions`,
   {
      method: "GET",
      headers: {
         "TRN-Api-Key": TRN_API_KEY
      }
   });
   return await trackerResp.json();
};