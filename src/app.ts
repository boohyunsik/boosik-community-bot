import 'reflect-metadata';
import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';
import { ALLOWED_GROUP_IDS, OPENAI_API_KEY, TELEGRAM_BOT_TOKEN } from "./config";

console.log('init bot with', TELEGRAM_BOT_TOKEN);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

console.log('init openai with', OPENAI_API_KEY);
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

function isAllowedGroup(chatId: number | string): boolean {
    // 문자열 비교를 위해 String 변환
    const chatIdStr = String(chatId);
    return ALLOWED_GROUP_IDS.includes(chatIdStr);
}

bot.command('project', async (ctx) => {
    try {
        console.log('project command from: ', ctx.chat.id);

        if (!isAllowedGroup(ctx.chat.id)) {
            await ctx.reply('허용된 채널이 아닙니다.');
            return;
        }

        console.log(`project command input, chatId: ${ctx.chat.id}`);
        await ctx.reply(`현재 진행중인 프로젝트입니다.\n` +
            `TG bot: https://github.com/boohyunsik/boosik-community-bot`);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Something was wrong, please retry or contract @i_am_boosik');
    }
})

bot.command('helpme', async (ctx) => {
    try {
        console.log('help command from: ', ctx.chat.id);
        if (!isAllowedGroup(ctx.chat.id)) {
            await ctx.reply('허용된 채널이 아닙니다.');
            return;
        }

        console.log(`helpme command input, chatId: ${ctx.chat.id}`);
        const helpList = [
            '/helpme: 지원 명령어를 조회합니다.',
            '/gpt {prompt}: GPT 4 모델에 질문합니다.',
        ]
        await ctx.reply(helpList.join('\n'));
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Something was wrong, please retry or contract @i_am_boosik');
    }
})

bot.command('gpt', async (ctx) => {
    try {
        console.log('gpt command from: ', ctx.chat.id);
        if (!isAllowedGroup(ctx.chat.id)) {
            await ctx.reply('허용된 채널이 아닙니다.');
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
                {
                    role: 'system',
                    content: '당신은 친절한 어시스트이며, 답변은 가능한 한 짧고 간결하게, 최대 5줄을 넘기지 않도록 해주세요.',
                },
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