import { pool } from "./db";
import { createTaskInGHL, createNoteInGHL } from "./ghl-api";
import pLimit from 'p-limit';

// Create a simple in-memory store for tokens keyed by locationId
export const tokenStore: { [key: string]: any } = {};

const GHL_API_LIMIT = 100;
const GHL_API_INTERVAL = 10 * 1000; // 10 seconds in milliseconds

const limit = pLimit(GHL_API_LIMIT);

export async function processTasksAndNotes() {
  try {
    const [tasks] = await pool.query('SELECT * FROM tasks'); // Assuming 'tasks' is the name of your tasks table
    const [notes] = await pool.query('SELECT * FROM notes'); // Assuming 'notes' is the name of your notes table

    // Ensure TypeScript recognizes these as arrays
    const taskArray = tasks as any[];
    const noteArray = notes as any[];

    const allPromises = [];

    for (const task of taskArray) {
      const clientId = task.clientId;
      allPromises.push(limit(() => createTaskInGHL(task, clientId, tokenStore)));
    }

    for (const note of noteArray) {
      const clientId = note.clientId;
      allPromises.push(limit(() => createNoteInGHL(note, clientId, tokenStore)));
    }

    await Promise.all(allPromises);

    console.log('All tasks and notes processed successfully');
  } catch (error) {
    console.error('Error processing tasks and notes:', error);
  }
}
