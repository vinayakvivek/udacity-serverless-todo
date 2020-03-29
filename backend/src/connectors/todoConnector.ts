import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';

const logger = createLogger('Connector:TodoConnector');
 
export class TodoConnector {

    constructor(
        private readonly docClient: DocumentClient = createDyanamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }

    async createTodo(item: TodoItem): Promise<TodoItem> {
        logger.info('Creating a Todo item', {
            todoId: item.todoId
        });

        await this.docClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();

        return item;
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Fetching all todo items of user', {userId});

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: "userId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId
            }
        }).promise();

        return result.Items as TodoItem[];
    }
}

function createDyanamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log('Creating a local DynamoDB client');
        return new AWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }
    return new AWS.DynamoDB.DocumentClient();
}