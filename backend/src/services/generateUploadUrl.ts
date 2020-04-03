import { createLogger } from '../utils/logger';
import { TodoConnector } from '../connectors/todoConnector';

const logger = createLogger('Service:generateUploadURL');
const todoConnector = new TodoConnector();

export async function generateUploadURL(todoId: string, userId: string, fileName: string): Promise<string> {
    logger.info('Generating upload URL', {todoId});
    return todoConnector.generateUploadURL(todoId, userId, fileName);
}