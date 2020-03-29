import "source-map-support/register";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
import { deleteTodo } from "../../services/deleteTodo";
import { errorPayload } from '../utils'

const logger = createLogger("Lambda:deleteTodo");

const processDeleteTodo: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    logger.info("Processing event", {
        path: event.path,
        context: event.requestContext
    });

    try {
        const authToken = event.headers.Authorization.split(" ")[1];
        const todoId = event.pathParameters.todoId;
        await deleteTodo(todoId, authToken);
        return {
            statusCode: 204,
            body: ''
        };
    } catch (e) {
        return errorPayload(e.message);
    }
};

export const handler = middy(processDeleteTodo);

handler.use(
    cors({
        credentials: true
    })
);
