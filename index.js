const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const WOLFRAM_APP_ID = process.env.WOLFRAM_APP_ID;
const GEMINI_KEY = process.env.GEMINI_KEY;

// Gemini Function
async function askGemini(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`;

    const response = await axios.post(url, {
        contents: [{ parts: [{ text: text }] }]
    });

    return response.data.candidates[0].content.parts[0].text;
}

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (!msg.text) return;

    const text = msg.text.toLowerCase();

    // Creator Name
    if (text.includes("kar dara toiri") || text.includes("apni kar")) {
        return bot.sendMessage(chatId, "আমি Talha দ্বারা তৈরি 🤖");
    }

    // Math Detect → Wolfram
    if (text.match(/[0-9+\-*/^=]/)) {
        try {
            const url = `http://api.wolframalpha.com/v1/result?i=${encodeURIComponent(text)}&appid=${WOLFRAM_APP_ID}`;
            const res = await axios.get(url);
            return bot.sendMessage(chatId, res.data);
        } catch {
            return bot.sendMessage(chatId, "Math সমাধান পাওয়া যায়নি।");
        }
    }

    // Normal Chat → Gemini
    try {
        const aiReply = await askGemini(text);
        bot.sendMessage(chatId, aiReply);
    } catch {
        bot.sendMessage(chatId, "AI সাময়িকভাবে কাজ করছে না।");
    }
});

console.log("Bot Running...");
