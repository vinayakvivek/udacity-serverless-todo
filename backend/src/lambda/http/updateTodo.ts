import 'source-map-support/register';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { updateTodo } from '../../services/updateTodo';

const logger = createLogger('Lambda:updateTodo');

const processUpdateTodo: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event', {event});
  const authToken = event.headers.Authorization.split(' ')[1];
  const data: UpdateTodoRequest = JSON.parse(event.body);
  const todoId = event.pathParameters.todoId;

  const updatedItem = await updateTodo(data, todoId, authToken);
  return {
    statusCode: 201,
    body: JSON.stringify({
      item: updatedItem
    }),
  }
}

export const handler = middy(processUpdateTodo);
  
handler.use(cors({
    credentials: true
}))
