var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { GHL } from "./ghl";
import pLimit from 'p-limit';
const GHL_API_LIMIT = 100;
const GHL_API_INTERVAL = 10 * 1000; // 10 seconds in milliseconds
const limit = pLimit(GHL_API_LIMIT);
const ghl = new GHL();
export function createTaskInGHL(task, clientId, tokenStore) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Apply rate limiting with pLimit
            yield limit(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield ghl.requests(clientId).post('/tasks', Object.assign({}, task), {
                    headers: {
                        Authorization: `Bearer ${tokenStore[clientId].access_token}`,
                        Version: '2021-07-28',
                    },
                });
                console.log('Task created:', response.data);
            }));
        }
        catch (error) {
            console.error('Error creating task:', error);
        }
    });
}
export function createNoteInGHL(note, clientId, tokenStore) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Apply rate limiting with pLimit
            yield limit(() => __awaiter(this, void 0, void 0, function* () {
                const response = yield ghl.requests(clientId).post('/notes', Object.assign({}, note), {
                    headers: {
                        Authorization: `Bearer ${tokenStore[clientId].access_token}`,
                        Version: '2021-07-28',
                    },
                });
                console.log('Note created:', response.data);
            }));
        }
        catch (error) {
            console.error('Error creating note:', error);
        }
    });
}
