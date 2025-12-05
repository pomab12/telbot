const TelegramBot = require("node-telegram-bot-api");

// 👉 Replace this with your BotFather token
const TOKEN = "7980199979:AAHQy-Zb6n_POnqCVQ1z--HshZxpyTeRZwk";

// Create bot with polling
const bot = new TelegramBot(TOKEN, { polling: true });

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "👋 Hello! I'm your personal assistance  Telegram Bot.\n\nType /help to see commands."
  );
});

// /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "📌 Available commands:\n/start - Start the bot\n/help - Show help\n/buttons - Show menu buttons"
  );
});

// Example: showing buttons
bot.onText(/\/buttons/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Choose an option:", {
    reply_markup: {
      keyboard: [
        ["💵 Balance", "➕ Add Income"],
        ["➖ Add Expense", "📊 Report"]
      ],
      resize_keyboard: true,
    },
  });
});

// Respond to any message
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "💵 Balance") {
    bot.sendMessage(chatId, "Your balance is: 0 ETB");
  }

  if (text === "➕ Add Income") {
    bot.sendMessage(chatId, "Enter your income amount:");
  }

  if (text === "➖ Add Expense") {
    bot.sendMessage(chatId, "Enter your expense amount:");
  }

  if (text === "📊 Report") {
    bot.sendMessage(chatId, "Your report is empty.");
  }
  console.log('bot is running')
});
