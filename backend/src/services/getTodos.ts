import { createLogger } from '../utils/logger';
import { parseUserId } from '../auth/utils';
import { TodoConnector } from '../connectors/todoConnector';
import { TodoItem } from '../models/TodoItem';

const logger = createLogger('Service:getTodos');
const todoConnector = new TodoConnector();

export async function getTodos(token: string): Promise<TodoItem[]> {
    logger.info('Fetching all todos', { authToken: token });
    const userId = parseUserId(token);
    return todoConnector.getAllTodos(userId);
}