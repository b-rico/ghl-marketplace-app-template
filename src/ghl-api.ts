import { GHL } from "./ghl";
import pLimit from 'p-limit';

const GHL_API_LIMIT = 100;
const GHL_API_INTERVAL = 10 * 1000; // 10 seconds in milliseconds

const limit = pLimit(GHL_API_LIMIT);
const ghl = new GHL();

export async function createTaskInGHL(task: any, clientId: string, tokenStore: any) {
  try {
    const response = await ghl.requests(clientId).post('/tasks', {
      ...task,
    }, {
      headers: {
        Authorization: `Bearer ${tokenStore[clientId].access_token}`,
        Version: '2021-07-28',
      },
    });
    console.log('Task created:', response.data);
  } catch (error) {
    console.error('Error creating task:', error);
  }
}

export async function createNoteInGHL(note: any, clientId: string, tokenStore: any) {
  try {
    const response = await ghl.requests(clientId).post('/notes', {
      ...note,
    }, {
      headers: {
        Authorization: `Bearer ${tokenStore[clientId].access_token}`,
        Version: '2021-07-28',
      },
    });
    console.log('Note created:', response.data);
  } catch (error) {
    console.error('Error creating note:', error);
  }
}
