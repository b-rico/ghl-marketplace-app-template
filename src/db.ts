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

export async function getTasksAndNotes() {
  try {
    const [tasks] = await pool.query('SELECT DISTINCT  * FROM `sbrc-migration`.`api_tasks_vw`;'); 
    const [notes] = await pool.query('SELECT DISTINCT  * FROM `sbrc-migration`.`api_activities_vw`;'); 
    return { tasks, notes };
} catch (error) {
  console.error('Error retrieving tasks and notes:', error);
  throw error;
}
}