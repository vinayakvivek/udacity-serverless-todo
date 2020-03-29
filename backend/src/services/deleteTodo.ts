import { createLogger } from '../utils/logger';
import { parseUserId } from '../auth/utils';
import { TodoConnector } from '../connectors/todoConnector';

const logger = createLogger('Service:updateTodo');
const todoConnector = new TodoConnector();

export async function deleteTodo(todoId:string, token: string) {

    const userId = parseUserId(token);

    logger.info('Deleting a Todo item', {
        todoId,
        userId
    })

    await todoConnector.deleteItem(userId, todoId);
}