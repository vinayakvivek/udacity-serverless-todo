import { createLogger } from '../utils/logger';
import { TodoConnector } from '../connectors/todoConnector';
import { parseUserId } from '../auth/utils';

const logger = createLogger('Service:generateUploadURL');
const todoConnector = new TodoConnector();

export async function generateUploadURL(todoId: string, token: string): Promise<string> {
    logger.info('Generating upload URL', {todoId});
    const userId = parseUserId(token);
    return todoConnector.generateUploadURL(todoId, userId);
}