const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const TOKEN = "7980199979:AAHQy-Zb6n_POnqCVQ1z--HshZxpyTeRZwk";
const bot = new TelegramBot(TOKEN, { polling: true });

let userState = {}; // Store temporary states

function loadData() {
  return JSON.parse(fs.readFileSync("./data.json"));
}

function saveData(data) {
  fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

function initUser(data, chatId) {
  if (!data.users[chatId]) {
    data.users[chatId] = {
      balance: 0,
      history: []
    };
    saveData(data);
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  let data = loadData();
  initUser(data, chatId);

  bot.sendMessage(chatId, "👋 Welcome to Pocket Manager Bot!", {
    reply_markup: {
      keyboard: [
        ["💵 Balance", "➕ Add Income"],
        ["➖ Add Expense", "📊 Report"]
      ],
      resize_keyboard: true
    }
  });
});

// Handle button clicks
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  let data = loadData();
  initUser(data, chatId);

  // State: waiting for income amount
  if (userState[chatId] === "waiting_income") {
    let amount = Number(text);

    if (isNaN(amount) || amount <= 0)
      return bot.sendMessage(chatId, "❌ Enter a valid number!");

    data.users[chatId].balance += amount;
    data.users[chatId].history.push({ type: "income", amount });

    saveData(data);
    userState[chatId] = null;

    return bot.sendMessage(chatId, `✅ Income added!\nNew balance: ${data.users[chatId].balance} ETB`);
  }

  // State: waiting for expense amount
  if (userState[chatId] === "waiting_expense") {
    let amount = Number(text);

    if (isNaN(amount) || amount <= 0)
      return bot.sendMessage(chatId, "❌ Enter a valid number!");

    if (amount > data.users[chatId].balance)
      return bot.sendMessage(chatId, "⚠️ Not enough balance!");

    data.users[chatId].balance -= amount;
    data.users[chatId].history.push({ type: "expense", amount });

    saveData(data);
    userState[chatId] = null;

    return bot.sendMessage(chatId, `🟡 Expense recorded!\nNew balance: ${data.users[chatId].balance} ETB`);
  }

  // MENU COMMANDS
  if (text === "💵 Balance") {
    return bot.sendMessage(chatId, `💵 Your balance: ${data.users[chatId].balance} ETB`);
  }

  if (text === "➕ Add Income") {
    userState[chatId] = "waiting_income";
    return bot.sendMessage(chatId, "Enter the income amount:");
  }

  if (text === "➖ Add Expense") {
    userState[chatId] = "waiting_expense";
    return bot.sendMessage(chatId, "Enter the expense amount:");
  }

  if (text === "📊 Report") {
    let history = data.users[chatId].history;
    if (history.length === 0) return bot.sendMessage(chatId, "Your report is empty.");

    let incomeTotal = history.filter(h => h.type === "income").reduce((a, b) => a + b.amount, 0);
    let expenseTotal = history.filter(h => h.type === "expense").reduce((a, b) => a + b.amount, 0);

    return bot.sendMessage(
      chatId,
      `📊 *Your Report*\n\n` +
      `Total Income: ${incomeTotal} ETB\n` +
      `Total Expense: ${expenseTotal} ETB\n` +
      `Current Balance: ${data.users[chatId].balance} ETB`,
      { parse_mode: "Markdown" }
    );
  }
});
