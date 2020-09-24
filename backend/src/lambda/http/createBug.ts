import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createBug } from '../../businessLogic/bugs'
import { createLogger } from '../../utils/logger';
import { CreateBugRequest } from '../../requests/CreateBugRequest';

const logger = createLogger('createBugHandler');
//Create a BUG item 
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('new bug item', event);

  const newTodo: CreateBugRequest = JSON.parse(event.body);
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];
  
  const newItem = await createBug(newTodo, jwtToken);
  return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
          item: newItem,
      }),
  };
};