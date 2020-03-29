import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getTodos } from '../../services/getTodos';

const logger = createLogger('Lambda:getTodos');

const processGetTodos: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {
    path: event.path,
    context: event.requestContext,
  });
  const authToken = event.headers.Authorization.split(' ')[1];
  const items = await getTodos(authToken);
  return {
    statusCode: 200,
    body: JSON.stringify({
      items
    })
  }
}

export const handler = middy(processGetTodos);
handler.use(cors({
    credentials: true
}))