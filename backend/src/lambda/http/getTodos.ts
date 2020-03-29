import "source-map-support/register";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayProxyHandler
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
import { getTodos } from "../../services/getTodos";
import { errorPayload } from '../utils'

const logger = createLogger("Lambda:getTodos");

const processGetTodos: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    logger.info("Processing event", {
        path: event.path,
        context: event.requestContext
    });

    try {
        const authToken = event.headers.Authorization.split(" ")[1];
        const items = await getTodos(authToken);
        return {
            statusCode: 200,
            body: JSON.stringify({
                items
            })
        };
    } catch (e) {
        return errorPayload(e.message);
    }
};

export const handler = middy(processGetTodos);
handler.use(
    cors({
        credentials: true
    })
);
