import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const TARGET_GROUP_ID = process.env.TARGET_GROUP_ID || '';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

bot.command('gpt', async (ctx) => {
    try {
        const chatId = String(ctx.chat.id);
        console.log("chatId", chatId);
        if (chatId !== TARGET_GROUP_ID) {
            console.log(`Unauthorized request from group (${chatId})`);
            return;
        }

        const text = ctx.message.text;
        const prompt = text.replace('/gpt', '').trim();

        if (!prompt) {
            await ctx.reply('/gpt {prompt}');
            return;
        }

        const response = await openai.chat.completions.create({
            model: 'chatgpt-4o-latest',
            messages: [
                { role: 'user', content: prompt },
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        const gptAnswer = response.choices[0]?.message?.content?.trim();
        if (!gptAnswer) {
            await ctx.reply('Wrong answer from GPT!');
            return;
        }

        await ctx.reply(gptAnswer);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Something was wrong, please retry or contract @i_am_boosik');
    }
});

bot.launch().then(() => {
    console.log('Telegram bot is running...');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));