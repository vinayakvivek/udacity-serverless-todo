import { createLogger } from '../utils/logger';
import { S3Connector } from '../connectors/s3Connector';

const logger = createLogger('Service:deleteS3Data');
const s3Connector = new S3Connector();

export async function deleteS3Data(userId: string, todoId: string) {
    logger.info('Deleting attachments', {todoId});
    await s3Connector.deleteAttachments(userId, todoId);
}