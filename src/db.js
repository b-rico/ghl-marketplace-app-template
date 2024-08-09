var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: decodeURIComponent(process.env.DB_PASSWORD || ''),
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
});
export function getTasksAndNotes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [tasks] = yield pool.query('SELECT DISTINCT  * FROM `sbrc-migration`.`api_tasks_vw`;');
            const [notes] = yield pool.query('SELECT DISTINCT  * FROM `sbrc-migration`.`api_activities_vw`;');
            return { tasks, notes };
        }
        catch (error) {
            console.error('Error retrieving tasks and notes:', error);
            throw error;
        }
    });
}
