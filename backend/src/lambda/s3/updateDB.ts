import "source-map-support/register";
import {
    S3Handler,
    S3Event
} from "aws-lambda";
import * as middy from "middy";

import { createLogger } from "../../utils/logger";
import { addAttachment } from '../../services/addAttachement';

const logger = createLogger("Lambda:updateOnS3Upload");

const processUpdateDBOnS3Upload: S3Handler = async (event: S3Event) => {
    for (const record of event.Records) {
        const key = record.s3.object.key;
        const bucketName = record.s3.bucket.name;
        logger.info("Processing record", {key, bucketName});
        await processRecord(key, bucketName);
        logger.info("Added attachment URL in DB");
    }
};

async function processRecord(key: string, bucketName: string) {
    const [userId, todoId, ] = key.split('/');
    const url = `https://${bucketName}.s3.amazonaws.com/${key}`;
    await addAttachment(userId, todoId, url);
}

export const handler = middy(processUpdateDBOnS3Upload);
