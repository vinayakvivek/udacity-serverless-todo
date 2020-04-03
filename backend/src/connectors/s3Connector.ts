import * as AWS from "aws-sdk";
import * as AWSXray from "aws-xray-sdk";
import { S3 } from "aws-sdk";

import { createLogger } from "../utils/logger";
import { TodoConnector } from "./todoConnector";

const logger = createLogger("Connector:S3Connector");
const XAWS = AWSXray.captureAWS(AWS);

const todoConnector = new TodoConnector();

export class S3Connector {

    constructor(
        private readonly s3Client: S3 = createS3Client(),
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiry: number = parseInt(
            process.env.SIGNED_URL_EXPIRATION
        )
    ) {}

    async generateUploadURL(todoId: string, userId: string, fileName: string) {
        await todoConnector.getByTodoId(userId, todoId);
        const s3Key = `${userId}/${todoId}/${fileName}`;
        logger.info("Generating PUT url", {key: s3Key});
        return this.s3Client.getSignedUrl("putObject", {
            Bucket: this.bucketName,
            Key: s3Key,
            Expires: this.urlExpiry
        });
    }
}

function createS3Client() {
    return new XAWS.S3({
        signatureVersion: "v4"
    });
}
