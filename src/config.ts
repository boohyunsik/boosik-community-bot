import * as dotenv from 'dotenv';
dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const RAW_GROUP_IDS = process.env.TARGET_GROUP_IDS || '';

export const ALLOWED_GROUP_IDS = RAW_GROUP_IDS.split(',').map((id) => id.trim());