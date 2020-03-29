import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createTodo } from '../../services/createTodo';

const logger = createLogger('Lambda:createTodo');

const processCreateTodo: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {event});
  const authToken = event.headers.Authorization.split(' ')[1];
  const data: CreateTodoRequest = JSON.parse(event.body);

  const newItem = await createTodo(data, authToken);
  return {
    statusCode: 201,
    body: JSON.stringify(newItem),
  }
}

export const handler = middy(processCreateTodo);
  
handler.use(cors({
    credentials: true
}))
