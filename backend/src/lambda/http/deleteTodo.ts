import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { deleteTodo } from '../../businessLogic/todos'

const logger = createLogger('deleteTodo')

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Remove a TODO item by id  
  const todoId = event.pathParameters.todoId;
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  logger.info('Delete TODO by id',event);
  
 console.log("EVENT:", event);
 const deleteTodoData = await deleteTodo(todoId, jwtToken);
 logger.info('Item deleted successfully')
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(deleteTodoData),
  };
};
