import "source-map-support/register";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    APIGatewayProxyHandler
} from "aws-lambda";
import * as middy from "middy";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
import { generateUploadURL } from '../../services/generateUploadUrl'
import { errorPayload } from '../utils'

const logger = createLogger("Lambda:generateUploadURL");

const processGenerateUploadURL: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    logger.info("Processing event", {
        path: event.path,
        context: event.requestContext
    });

    try {
        const authToken = event.headers.Authorization.split(" ")[1];
        const todoId = event.pathParameters.todoId;
        const url = await generateUploadURL(todoId, authToken);
        return {
            statusCode: 200,
            body: JSON.stringify({
                uploadUrl: url
            })
        };
    } catch (e) {
        return errorPayload(e.message);
    }
};


export const handler = middy(processGenerateUploadURL);
handler.use(
    cors({
        credentials: true
    })
);
