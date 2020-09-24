import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { deleteBug } from '../../businessLogic/bugs'

const logger = createLogger('deleteBug')

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Remove a BUG item by id  
  const bugId = event.pathParameters.bugId;
  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  logger.info('Delete BUG by id',event);
  
 console.log("EVENT:", event);
 const deleteBugData = await deleteBug(bugId, jwtToken);
 logger.info('Bug deleted successfully!')
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(deleteBugData),
  };
};
