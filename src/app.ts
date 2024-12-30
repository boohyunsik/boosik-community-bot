import 'reflect-metadata';
import { Telegraf } from 'telegraf';
import { OpenAI } from 'openai';
import { AppDataSource } from "./dataSource";
import { User } from "./entity/User";
import { isValidEthereumAddress } from "./ethereum";
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

// ------------------ /register {address} ------------------
bot.command('register', async (ctx) => {
    try {
        console.log('register command from: ', ctx.chat.id);

        if (!isAllowedGroup(ctx.chat.id)) {
            await ctx.reply('허용된 채널이 아닙니다.');
            return;
        }

        const text = ctx.message.text;
        const parts = text.split(' ');
        if (parts.length < 2) {
            await ctx.reply('사용법: /register 0x1234...');
            return;
        }
        const address = parts.slice(1).join(' ').trim();

        if (!isValidEthereumAddress(address)) {
            await ctx.reply('올바른 이더리움 주소가 아닙니다.');
            return;
        }

        const telegramId = ctx.from?.id;
        const username = ctx.from?.username || '';

        if (!telegramId) {
            await ctx.reply('텔레그램 유저 정보를 확인할 수 없습니다.');
            return;
        }

        const userRepo = AppDataSource.getRepository(User);
        let user = await userRepo.findOneBy({ telegramId });

        if (!user) {
            user = new User();
            user.telegramId = telegramId;
        }

        user.username = username;
        user.address = address;

        await userRepo.save(user);

        await ctx.reply(`주소 등록/업데이트 완료:
username: ${user.username}
address: ${user.address}`);
    } catch (error) {
        console.error('[register] error:', error);
        await ctx.reply('오류가 발생했습니다.');
    }
});

// ------------------ /show ------------------
bot.command('show', async (ctx) => {
    try {
        console.log('show command from: ', ctx.chat.id);

        if (!isAllowedGroup(ctx.chat.id)) {
            await ctx.reply('허용된 채널이 아닙니다.');
            return;
        }

        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply('텔레그램 유저 정보를 확인할 수 없습니다.');
            return;
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ telegramId });

        if (!user) {
            await ctx.reply('아직 등록된 주소가 없습니다. /register 로 등록해주세요.');
            return;
        }

        await ctx.reply(`등록된 주소:
username: ${user.username}
address: ${user.address}`);
    } catch (error) {
        console.error('[show] error:', error);
        await ctx.reply('오류가 발생했습니다.');
    }
});

// ------------------ /delete ------------------
bot.command('delete', async (ctx) => {
    try {
        console.log('delete command from: ', ctx.chat.id);

        if (!isAllowedGroup(ctx.chat.id)) {
            await ctx.reply('허용된 채널이 아닙니다.');
            return;
        }

        const telegramId = ctx.from?.id;
        if (!telegramId) {
            await ctx.reply('텔레그램 유저 정보를 확인할 수 없습니다.');
            return;
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ telegramId });

        if (!user) {
            await ctx.reply('삭제할 데이터가 없습니다.');
            return;
        }

        await userRepo.remove(user);
        await ctx.reply('주소 정보를 삭제했습니다.');
    } catch (error) {
        console.error('[delete] error:', error);
        await ctx.reply('오류가 발생했습니다.');
    }
});

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
            '/register {address}: 내 BASE 지갑 주소를 등록합니다.',
            '/show: 등록한 지갑 주소를 조회합니다.',
            '/delete: 등록한 지갑 주소를 삭제합니다.'
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