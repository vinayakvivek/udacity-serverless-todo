import { createLogger } from '../utils/logger';
import { S3Connector } from '../connectors/s3Connector';

const logger = createLogger('Service:generateUploadURL');
const s3Connector = new S3Connector();

export async function generateUploadURL(todoId: string, userId: string, fileName: string): Promise<string> {
    logger.info('Generating upload URL', {todoId});
    return s3Connector.generateUploadURL(todoId, userId, fileName);
}