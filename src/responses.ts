export const anaylzeSpelling = async (
  message: string,
  chanceOfAction: number,
  cbAction: (wordInMessage: string) => Promise<void>
) => {
  var d = Math.random();
  var tokens = message.split(" ");
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
  if (d < chanceOfAction && message.toLowerCase().includes("fuck you")) {
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
  const insultResp = await fetch(
    "https://evilinsult.com/generate_insult.php?lang=en&type=json",
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }
  );
  return await insultResp.json();
};

const fetchPun = async () => {
  const punResp = await fetch(
    "https://v2.jokeapi.dev/joke/Pun?blacklistFlags=racist,sexist&type=single",
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    }
  );
  return await punResp.json();
};

