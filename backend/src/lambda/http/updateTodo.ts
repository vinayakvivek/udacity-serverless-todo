import "source-map-support/register";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
import { UpdateTodoRequest } from "../../requests/UpdateTodoRequest";
import { updateTodo } from "../../services/updateTodo";
import { errorPayload } from '../utils'

const logger = createLogger("Lambda:updateTodo");

const processUpdateTodo: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    logger.info("Processing event", {
        path: event.path,
        context: event.requestContext
    });

    try {
        const authToken = event.headers.Authorization.split(" ")[1];
        const data: UpdateTodoRequest = JSON.parse(event.body);
        const todoId = event.pathParameters.todoId;
        const updatedItem = await updateTodo(data, todoId, authToken);
        return {
            statusCode: 200,
            // TODO: return empty
            body: JSON.stringify({
                item: updatedItem
            })
        };
    } catch (e) {
        return errorPayload(e.message);
    }
};

export const handler = middy(processUpdateTodo);

handler.use(
    cors({
        credentials: true
    })
);
