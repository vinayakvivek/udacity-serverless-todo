import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { createLogger } from "../utils/logger";
import { TodoItem } from "../models/TodoItem";

const logger = createLogger("Connector:TodoConnector");

export class TodoConnector {
    constructor(
        private readonly docClient: DocumentClient = createDyanamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.INDEX_NAME
    ) {}

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info("Fetching all todo items of user", { userId });

        const result = await this.docClient
            .query({
                TableName: this.todosTable,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {
                    ":userId": userId
                }
            })
            .promise();

        return result.Items as TodoItem[];
    }

    async createTodo(item: TodoItem): Promise<TodoItem> {
        logger.info("Creating a Todo item", { item });
        item.attachmentUrls = [];
        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: item
            })
            .promise();

        return item;
    }

    async updateTodo(item: TodoItem): Promise<TodoItem> {
        const itemData = await this.getByTodoId(item.userId, item.todoId);

        const key = {
            userId: item.userId,
            createdAt: itemData.createdAt
        };

        logger.info("Updating item", { key });

        const result = await this.docClient
            .update({
                TableName: this.todosTable,
                Key: key,
                UpdateExpression:
                    "set done = :done, #name = :name, dueDate = :dueDate",
                ExpressionAttributeNames: {
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":done": item.done,
                    ":name": item.name,
                    ":dueDate": item.dueDate
                },
                ReturnValues: "ALL_NEW"
            })
            .promise();

        return result.Attributes as TodoItem;
    }

    async deleteItem(userId: string, todoId: string) {
        const itemData = await this.getByTodoId(userId, todoId);

        await this.docClient
            .delete({
                TableName: this.todosTable,
                Key: {
                    userId,
                    createdAt: itemData.createdAt
                }
            })
            .promise();
    }

    async addAttachmentUrl(userId: string, todoId: string, url: string) {
        const itemData = await this.getByTodoId(userId, todoId);

        const key = {
            userId: userId,
            createdAt: itemData.createdAt
        };

        logger.info("Adding attachement url", { key });

        await this.docClient
            .update({
                TableName: this.todosTable,
                Key: key,
                UpdateExpression:
                    "set attachmentUrls = list_append(attachmentUrls, :newUrl)",
                ExpressionAttributeValues: {
                    ":newUrl": [url]
                },
                ReturnValues: "ALL_NEW"
            })
            .promise();
    }

    async getByTodoId(userId: string, todoId: string): Promise<TodoItem> {
        const data = await this.docClient
            .query({
                TableName: this.todosTable,
                IndexName: this.indexName,
                KeyConditionExpression: "userId = :userId and todoId = :todoId",
                ExpressionAttributeValues: {
                    ":userId": userId,
                    ":todoId": todoId
                }
            })
            .promise();

        if (data.Items.length === 0) {
            logger.info("Value does not exist", { userId, todoId });
            throw new Error("Item does not exist");
        }

        return data.Items[0] as TodoItem;
    }
}

function createDyanamoDBClient() {
    if (process.env.IS_OFFLINE) {
        console.log("Creating a local DynamoDB client");
        return new AWS.DynamoDB.DocumentClient({
            region: "localhost",
            endpoint: "http://localhost:8000"
        });
    }
    return new AWS.DynamoDB.DocumentClient();
}
