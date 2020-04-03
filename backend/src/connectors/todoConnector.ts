import * as AWS from "aws-sdk";
import * as AWSXray from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { createLogger } from "../utils/logger";
import { TodoItem } from "../models/TodoItem";
import { S3 } from "aws-sdk";

const logger = createLogger("Connector:TodoConnector");
const XAWS = AWSXray.captureAWS(AWS);

export class TodoConnector {
    constructor(
        private readonly docClient: DocumentClient = createDyanamoDBClient(),
        private readonly s3Client: S3 = createS3Client(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.INDEX_NAME,
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiry: number = parseInt(
            process.env.SIGNED_URL_EXPIRATION
        )
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

    async generateUploadURL(todoId: string, userId: string, fileName: string) {
        await this.getByTodoId(userId, todoId);
        const s3Key = `${userId}/${todoId}/${fileName}`
        return this.s3Client.getSignedUrl("putObject", {
            Bucket: this.bucketName,
            Key: s3Key,
            Expires: this.urlExpiry
        });
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

function createS3Client() {
    return new XAWS.S3({
        signatureVersion: "v4"
    });
}
