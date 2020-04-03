import { createLogger } from '../utils/logger';
import { TodoConnector } from '../connectors/todoConnector';

const logger = createLogger('Service:addAttachment');
const todoConnector = new TodoConnector();

export async function addAttachment(userId: string, todoId: string, url: string) {
    logger.info("Adding an attachment URL", {
        userId,
        todoId,
        url
    });
    await todoConnector.addAttachmentUrl(userId, todoId, url);
}