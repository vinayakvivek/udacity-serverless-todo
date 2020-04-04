import "source-map-support/register";
import {
    DynamoDBStreamHandler,
    DynamoDBStreamEvent
} from "aws-lambda";
import * as middy from "middy";

import { createLogger } from "../../utils/logger";
import { deleteS3Data } from '../../services/deleteS3Data';

const logger = createLogger("Lambda:DeleteS3Data");

const processDeleteS3Data: DynamoDBStreamHandler = async(event: DynamoDBStreamEvent) => {
    logger.info("Processing DB stream event", {event})

    for (const record of event.Records) {
        try {
            const userId = record.dynamodb.Keys.userId.S;
            const todoId = record.dynamodb.OldImage.todoId.S;
            logger.info("Processing data", {userId, todoId});
            if (record.eventName === 'REMOVE') {
                await deleteS3Data(userId, todoId);
            }
        } catch (e) {
            logger.error(e.message);
        }
    }
} 

export const handler = middy(processDeleteS3Data);
