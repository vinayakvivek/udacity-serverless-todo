import "source-map-support/register";
import {
    S3Handler,
    S3Event
} from "aws-lambda";
import * as middy from "middy";

import { createLogger } from "../../utils/logger";

const logger = createLogger("Lambda:updateOnS3Upload");

const processUpdateDBOnS3Upload: S3Handler = async (event: S3Event) => {
    for (const record of event.Records) {
        logger.info("Processing record", {key: record.s3.object.key});
    }
};

// function processRecord(key: string) {

// }

export const handler = middy(processUpdateDBOnS3Upload);
