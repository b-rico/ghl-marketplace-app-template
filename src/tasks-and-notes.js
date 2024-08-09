var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { pool } from "./db";
import { createTaskInGHL, createNoteInGHL } from "./ghl-api";
import pLimit from 'p-limit';
// Create a simple in-memory store for tokens keyed by locationId
export const tokenStore = {};
const GHL_API_LIMIT = 100;
const GHL_API_INTERVAL = 10 * 1000; // 10 seconds in milliseconds
const limit = pLimit(GHL_API_LIMIT);
export function processTasksAndNotes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [tasks] = yield pool.query('SELECT * FROM tasks'); // Assuming 'tasks' is the name of your tasks table
            const [notes] = yield pool.query('SELECT * FROM notes'); // Assuming 'notes' is the name of your notes table
            // Ensure TypeScript recognizes these as arrays
            const taskArray = tasks;
            const noteArray = notes;
            const allPromises = [];
            for (const task of taskArray) {
                const clientId = task.clientId;
                allPromises.push(limit(() => createTaskInGHL(task, clientId, tokenStore)));
            }
            for (const note of noteArray) {
                const clientId = note.clientId;
                allPromises.push(limit(() => createNoteInGHL(note, clientId, tokenStore)));
            }
            yield Promise.all(allPromises);
            console.log('All tasks and notes processed successfully');
        }
        catch (error) {
            console.error('Error processing tasks and notes:', error);
        }
    });
}
