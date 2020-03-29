import { createLogger } from '../utils/logger';
import { TodoConnector } from '../connectors/todoConnector';

const logger = createLogger('Service:generateUploadURL');
const todoConnector = new TodoConnector();

export function generateUploadURL(todoId: string): string {
    logger.info('Generating upload URL', {todoId});
    return todoConnector.generateUploadURL(todoId);
}