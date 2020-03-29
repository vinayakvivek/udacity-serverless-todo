import { createLogger } from '../utils/logger';
import { parseUserId } from '../auth/utils';
import { TodoConnector } from '../connectors/todoConnector';
import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const logger = createLogger('Service:updateTodo');
const todoConnector = new TodoConnector();

export async function updateTodo(data: UpdateTodoRequest, todoId:string, token: string): Promise<TodoItem> {

    const userId = parseUserId(token);

    logger.info('Updating a Todo item', {
        todoId,
        userId
    })

    return todoConnector.updateTodo({
        userId,
        todoId,
        createdAt: null,
        ...data
    });
}