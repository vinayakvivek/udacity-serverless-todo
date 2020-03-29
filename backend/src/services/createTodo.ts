import { v4 as uuidv4 } from 'uuid';

import { createLogger } from '../utils/logger';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { parseUserId } from '../auth/utils';
import { TodoConnector } from '../connectors/todoConnector';
import { TodoItem } from '../models/TodoItem';

const logger = createLogger('Service:createTodo');
const todoConnector = new TodoConnector();

export async function createTodo(data: CreateTodoRequest, token: string): Promise<TodoItem> {

    const todoId = uuidv4();  // unique Id
    const createdAt = new Date().toISOString();
    const done: boolean = false;
    const userId = parseUserId(token);

    logger.info('Creating a Todo item', {
        todoId,
        userId
    })

    return todoConnector.createTodo({
        userId,
        todoId,
        createdAt,
        done,
        name: data.name,
        dueDate: data.dueDate
    });
}