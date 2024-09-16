const { Telegraf, Input } = require("telegraf");
const dotenv = require("dotenv");

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {});

bot.launch(() => {
  console.log("Bot is started");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
