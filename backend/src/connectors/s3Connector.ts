import * as AWS from "aws-sdk";
import * as AWSXray from "aws-xray-sdk";
import { S3 } from "aws-sdk";

import { createLogger } from "../utils/logger";
import { TodoConnector } from "./todoConnector";

const logger = createLogger("Connector:S3Connector");
const XAWS = AWSXray.captureAWS(AWS);

let todoConnector;

export class S3Connector {

    constructor(
        private readonly s3Client: S3 = createS3Client(),
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiry: number = parseInt(
            process.env.SIGNED_URL_EXPIRATION
        )
    ) {}

    async generateUploadURL(todoId: string, userId: string, fileName: string) {
        if (!todoConnector) {
            todoConnector = new TodoConnector();
        }
        await todoConnector.getByTodoId(userId, todoId);
        const s3Key = `${userId}/${todoId}/${fileName}`;
        logger.info("Generating PUT url", {key: s3Key});
        return this.s3Client.getSignedUrl("putObject", {
            Bucket: this.bucketName,
            Key: s3Key,
            Expires: this.urlExpiry
        });
    }

    async deleteAttachments(userId: string, todoId: string) {
        const dir = `${userId}/${todoId}/`;
        await this.deleteFolderContents(dir);
    }

    async deleteFolderContents(folder: string) {
        logger.info("Deleting folder contents", {folder});

        const listedObjects = await this.s3Client.listObjectsV2({
            Bucket: this.bucketName,
            Prefix: folder
        }).promise();
        
        if (listedObjects.Contents.length === 0) return;
        
        const deleteParams = {
            Bucket: this.bucketName,
            Delete: { Objects: [] }
        };
    
        listedObjects.Contents.forEach(({ Key }) => {
            logger.info("Fetching to delete", {Key});
            deleteParams.Delete.Objects.push({ Key });
        });

        await this.s3Client.deleteObjects(deleteParams).promise();

        if (listedObjects.IsTruncated) await this.deleteFolderContents(folder);
    }
}

function createS3Client() {
    return new XAWS.S3({
        signatureVersion: "v4"
    });
}
