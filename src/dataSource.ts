import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from './entity/User';

dotenv.config();

console.log('Database init...', process.env.DB_HOST, process.env.DB_PORT, process.env.DB_USER);

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [User],
});

AppDataSource.initialize().then((result) => {
    console.log('Database initialized=', result);
})